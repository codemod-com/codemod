import {
	ChildProcessWithoutNullStreams,
	exec,
	spawn,
} from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import * as readline from "node:readline";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import prettyReporter from "io-ts-reporters";
import { FileSystem, Uri, commands, window, workspace } from "vscode";
import { Case } from "../cases/types";
import {
	CodemodEntry,
	PrivateCodemodEntry,
	codemodNamesCodec,
} from "../codemods/types";
import { Configuration } from "../configuration";
import { Container } from "../container";
import { Store } from "../data";
import { parseCodemodConfigSchema } from "../data/codemodConfigSchema";
import { parsePrivateCodemodsEnvelope } from "../data/privateCodemodsEnvelopeSchema";
import { actions } from "../data/slice";
import { parseUrlParamsEnvelope } from "../data/urlParamsEnvelopeSchema";
import { ExecutionError, executionErrorCodec } from "../errors/types";
import { SEARCH_PARAMS_KEYS } from "../extension";
import { buildJobHash } from "../jobs/buildJobHash";
import { Job, JobKind } from "../jobs/types";
import { CodemodHash } from "../packageJsonAnalyzer/types";
import {
	buildCrossplatformArg,
	buildTypeCodec,
	isNeitherNullNorUndefined,
	streamToString,
} from "../utilities";
import { buildArguments } from "./buildArguments";
import { Message, MessageBus, MessageKind } from "./messageBus";

export class EngineNotFoundError extends Error {}
export class UnableToParseEngineResponseError extends Error {}
export class InvalidEngineResponseFormatError extends Error {}

export const Messages = {
	noAffectedFiles:
		"The codemod has run successfully but didn’t do anything" as const,
	noImportedMod: "No imported codemod was found" as const,
};

const TERMINATE_IDLE_PROCESS_TIMEOUT = 30 * 1000;

export enum EngineMessageKind {
	finish = 2,
	rewrite = 3,
	progress = 6,
	delete = 7,
	move = 8,
	create = 9,
	copy = 10,
}

export const messageCodec = t.union([
	buildTypeCodec({
		k: t.literal(EngineMessageKind.rewrite),
		i: t.string,
		o: t.string,
	}),
	buildTypeCodec({
		k: t.literal(EngineMessageKind.finish),
	}),
	buildTypeCodec({
		k: t.literal(EngineMessageKind.progress),
		p: t.number,
		t: t.number,
	}),
	buildTypeCodec({
		k: t.literal(EngineMessageKind.delete),
		oldFilePath: t.string,
	}),
	buildTypeCodec({
		k: t.literal(EngineMessageKind.move),
		oldFilePath: t.string,
		newFilePath: t.string,
	}),
	buildTypeCodec({
		k: t.literal(EngineMessageKind.create),
		newFilePath: t.string,
		newContentPath: t.string,
	}),
	buildTypeCodec({
		k: t.literal(EngineMessageKind.copy),
		oldFilePath: t.string,
		newFilePath: t.string,
	}),
	buildTypeCodec({
		kind: t.literal("rewrite"),
		oldPath: t.string,
		newDataPath: t.string,
	}),
	buildTypeCodec({
		kind: t.literal("finish"),
	}),
	buildTypeCodec({
		kind: t.literal("progress"),
		processedFileNumber: t.number,
		totalFileNumber: t.number,
	}),
	buildTypeCodec({
		kind: t.literal("delete"),
		oldFilePath: t.string,
	}),
	buildTypeCodec({
		kind: t.literal("move"),
		oldFilePath: t.string,
		newFilePath: t.string,
	}),
	buildTypeCodec({
		kind: t.literal("create"),
		newFilePath: t.string,
		newContentPath: t.string,
	}),
	buildTypeCodec({
		kind: t.literal("copy"),
		oldFilePath: t.string,
		newFilePath: t.string,
	}),
]);

type EngineMessage = t.TypeOf<typeof messageCodec>;

export const verboseEngineMessage = (message: EngineMessage): EngineMessage => {
	if (!("k" in message)) {
		return message;
	}

	if (message.k === EngineMessageKind.rewrite) {
		return {
			kind: "rewrite",
			oldPath: message.i,
			newDataPath: message.o,
		};
	}

	if (message.k === EngineMessageKind.finish) {
		return {
			kind: "finish",
		};
	}

	if (message.k === EngineMessageKind.progress) {
		return {
			kind: "progress",
			processedFileNumber: message.p,
			totalFileNumber: message.t,
		};
	}

	if (message.k === EngineMessageKind.delete) {
		return {
			kind: "delete",
			oldFilePath: message.oldFilePath,
		};
	}

	if (message.k === EngineMessageKind.move) {
		return {
			kind: "move",
			oldFilePath: message.oldFilePath,
			newFilePath: message.newFilePath,
		};
	}

	if (message.k === EngineMessageKind.create) {
		return {
			kind: "create",
			newFilePath: message.newFilePath,
			newContentPath: message.newContentPath,
		};
	}

	return {
		kind: "copy",
		oldFilePath: message.oldFilePath,
		newFilePath: message.newFilePath,
	};
};

type Execution = {
	readonly childProcess: ChildProcessWithoutNullStreams;
	readonly codemodHash: CodemodHash | null;
	readonly jobs: Job[];
	readonly targetUri: Uri;
	readonly happenedAt: string;
	readonly case: Case;
	totalFileCount: number;
	halted: boolean;
	affectedAnyFile: boolean;
};

type ExecuteCodemodMessage = Message &
	Readonly<{
		kind: MessageKind.executeCodemodSet;
	}>;

const CODEMOD_ENGINE_NODE_COMMAND = "codemod";
const CODEMOD_ENGINE_NODE_POLLING_INTERVAL = 5000;
const CODEMOD_ENGINE_NODE_POLLING_ITERATIONS_LIMIT = 100;

export class EngineService {
	readonly #configurationContainer: Container<Configuration>;
	readonly #fileSystem: FileSystem;
	readonly #messageBus: MessageBus;

	#execution: Execution | null = null;
	private __codemodEngineRustExecutableUri: Uri | null = null;
	private __executionMessageQueue: ExecuteCodemodMessage[] = [];

	public constructor(
		configurationContainer: Container<Configuration>,
		messageBus: MessageBus,
		fileSystem: FileSystem,
		private readonly __store: Store,
	) {
		this.#configurationContainer = configurationContainer;
		this.#messageBus = messageBus;
		this.#fileSystem = fileSystem;

		messageBus.subscribe(MessageKind.engineBootstrapped, (message) =>
			this.#onEnginesBootstrappedMessage(message),
		);

		messageBus.subscribe(MessageKind.executeCodemodSet, (message) => {
			this.#onExecuteCodemodSetMessage(message);
		});

		this.__pollCodemodEngineNode();
	}

	private async __pollCodemodEngineNode() {
		let iterations = 0;

		const checkCodemodEngineNode = async () => {
			if (iterations > CODEMOD_ENGINE_NODE_POLLING_ITERATIONS_LIMIT) {
				clearInterval(codemodEnginePollingIntervalId);
			}

			const codemodEngineNodeLocated = await this.isCodemodEngineNodeLocated();

			this.#messageBus.publish({
				kind: MessageKind.codemodEngineNodeLocated,
				codemodEngineNodeLocated,
			});

			if (codemodEngineNodeLocated) {
				this.__onCodemodEngineNodeLocated();
				clearInterval(codemodEnginePollingIntervalId);
			}

			iterations++;
		};

		// we retry codemod engine installation checks automatically, so we can detect when user installs the codemod
		const codemodEnginePollingIntervalId = setInterval(
			checkCodemodEngineNode,
			CODEMOD_ENGINE_NODE_POLLING_INTERVAL,
		);

		checkCodemodEngineNode();
	}

	private async __onCodemodEngineNodeLocated() {
		await this.syncRegistry();
		await this.__fetchCodemods();
		await this.fetchPrivateCodemods();
	}

	async #onEnginesBootstrappedMessage(
		message: Message & { kind: MessageKind.engineBootstrapped },
	) {
		this.__codemodEngineRustExecutableUri =
			message.codemodEngineRustExecutableUri;
	}

	private __getCodemodEngineRustExecutableCommand() {
		if (this.__codemodEngineRustExecutableUri === null) {
			throw new Error("The engines are not bootstrapped.");
		}

		return buildCrossplatformArg(this.__codemodEngineRustExecutableUri.fsPath);
	}

	public async syncRegistry(): Promise<void> {
		const childProcess = spawn(CODEMOD_ENGINE_NODE_COMMAND, ["syncRegistry"], {
			stdio: "pipe",
			shell: true,
			detached: false,
		});

		return new Promise<void>((resolve, reject) => {
			childProcess.once("exit", () => {
				resolve();
			});

			childProcess.once("error", (error) => {
				reject(error);
			});
		});
	}

	public async isCodemodEngineNodeLocated(): Promise<boolean> {
		const command = [
			CODEMOD_ENGINE_NODE_COMMAND,
			buildCrossplatformArg("--version"),
		].join(" ");

		const childProcess = exec(command, { timeout: 3000 });

		if (childProcess.stdout === null) {
			return false;
		}

		const result = await streamToString(childProcess.stdout);

		return result.length !== 0;
	}

	public async __getCodemodNames(): Promise<ReadonlyArray<string>> {
		const childProcess = spawn(
			CODEMOD_ENGINE_NODE_COMMAND,
			["list", "--json"],
			{
				stdio: "pipe",
				shell: true,
				detached: false,
			},
		);

		const codemodListJSON = await streamToString(childProcess.stdout);
		try {
			const codemodListOrError = codemodNamesCodec.decode(
				JSON.parse(codemodListJSON),
			);

			if (codemodListOrError._tag === "Left") {
				const report = prettyReporter.report(codemodListOrError);
				throw new InvalidEngineResponseFormatError(report.join("\n"));
			}

			return codemodListOrError.right.names;
		} catch (e) {
			if (e instanceof InvalidEngineResponseFormatError) {
				throw e;
			}

			throw new UnableToParseEngineResponseError(
				"Unable to parse engine output",
			);
		}
	}

	private async __fetchCodemods(): Promise<void> {
		try {
			const names = await this.__getCodemodNames();

			const codemodEntries: CodemodEntry[] = [];
			for (const name of names) {
				const hashDigest = createHash("ripemd160")
					.update(name)
					.digest("base64url");

				const configPath = join(
					homedir(),
					".codemod",
					hashDigest,
					"config.json",
				);

				const data = await readFile(configPath, "utf8");

				const config = parseCodemodConfigSchema(JSON.parse(data));

				if (config.engine === "piranha") {
					codemodEntries.push({
						kind: "piranhaRule",
						hashDigest,
						name,
						language: config.language,
						arguments: config.arguments,
					});

					continue;
				}

				if (
					config.engine === "jscodeshift" ||
					config.engine === "ts-morph" ||
					config.engine === "filemod" ||
					config.engine === "repomod-engine" ||
					config.engine === "recipe"
				) {
					codemodEntries.push({
						kind: "codemod",
						hashDigest,
						name,
						engine: config.engine,
						arguments: config.arguments,
					});
				}
			}

			this.__store.dispatch(actions.setCodemods(codemodEntries));
		} catch (e) {
			console.error(e);
		}
	}

	public async fetchPrivateCodemods(): Promise<void> {
		try {
			const privateCodemods: PrivateCodemodEntry[] = [];
			const globalStoragePath = join(homedir(), ".codemod");
			const privateCodemodNamesPath = join(
				homedir(),
				".codemod",
				"privateCodemodNames.json",
			);
			if (!existsSync(privateCodemodNamesPath)) {
				return;
			}

			const privateCodemodNamesJSON = await readFile(privateCodemodNamesPath, {
				encoding: "utf8",
			});

			const json = JSON.parse(privateCodemodNamesJSON);

			const { names } = parsePrivateCodemodsEnvelope(json);

			for (const hash of names) {
				const configPath = join(globalStoragePath, hash, "config.json");

				if (!existsSync(configPath)) {
					continue;
				}

				const urlParamsPath = join(globalStoragePath, hash, "urlParams.json");

				if (!existsSync(urlParamsPath)) {
					continue;
				}

				const data = await readFile(configPath, { encoding: "utf8" });

				try {
					const configSchema = parseCodemodConfigSchema(JSON.parse(data));

					const urlParamsData = existsSync(urlParamsPath)
						? await readFile(urlParamsPath, {
								encoding: "utf8",
						  })
						: null;

					const permalink =
						urlParamsData !== null ? new URL("https://codemod.studio/") : null;

					if (permalink !== null && urlParamsData !== null) {
						const { urlParams } = parseUrlParamsEnvelope(
							JSON.parse(urlParamsData),
						);

						permalink.search = urlParams;
					}

					let name = hash;

					if (urlParamsData !== null) {
						// find codemod name from the stored url parameters
						const envelope = parseUrlParamsEnvelope(JSON.parse(urlParamsData));

						const urlParams = new URLSearchParams(envelope.urlParams);

						const codemodName = urlParams.get(SEARCH_PARAMS_KEYS.CODEMOD_NAME);

						if (codemodName !== null) {
							const decodedCodemodName = Buffer.from(
								codemodName,
								"base64url",
							).toString("utf8");
							name = decodedCodemodName;
						}
					}

					if (configSchema.engine === "jscodeshift") {
						privateCodemods.push({
							kind: "codemod",
							engine: "jscodeshift",
							hashDigest: hash,
							name,
							permalink: permalink?.toString() ?? null,
						});
					}
				} catch (error) {
					console.error(error);
				}
			}

			this.__store.dispatch(actions.upsertPrivateCodemods(privateCodemods));
		} catch (e) {
			console.error(e);
		}
	}

	public isExecutionInProgress(): boolean {
		return this.#execution !== null;
	}

	shutdownEngines() {
		if (!this.#execution) {
			return;
		}

		this.#execution.halted = true;
		this.#execution.childProcess.stdin.write("shutdown\n");
	}

	private __getQueuedCodemodHashes(): ReadonlyArray<CodemodHash> {
		return this.__executionMessageQueue
			.map(({ command }) =>
				"codemodHash" in command ? command.codemodHash : null,
			)
			.filter(isNeitherNullNorUndefined);
	}

	async #onExecuteCodemodSetMessage(
		message: Message & { kind: MessageKind.executeCodemodSet },
	) {
		if (this.#execution) {
			if (message.command.kind === "executeCodemod") {
				this.__executionMessageQueue.push(message as ExecuteCodemodMessage);

				this.#messageBus.publish({
					kind: MessageKind.executionQueueChange,
					queuedCodemodHashes: this.__getQueuedCodemodHashes(),
				});

				return;
			}

			await window.showErrorMessage(
				"Wait until the previous codemod set execution has finished",
			);
			return;
		}

		const codemodHash =
			message.command.kind === "executeCodemod" ||
			message.command.kind === "executeLocalCodemod"
				? message.command.codemodHash
				: null;

		this.#messageBus.publish({
			kind: MessageKind.showProgress,
			codemodHash,
			progressKind: "infinite",
			totalFileNumber: 0,
			processedFileNumber: 0,
		});

		const storageUri = Uri.joinPath(message.storageUri, "codemod-engine-node");

		await this.#fileSystem.createDirectory(message.storageUri);
		await this.#fileSystem.createDirectory(storageUri);

		const args = buildArguments(
			this.#configurationContainer.get(),
			message,
			storageUri,
		);

		const executableCommand =
			message.command.kind === "executePiranhaRule"
				? this.__getCodemodEngineRustExecutableCommand()
				: CODEMOD_ENGINE_NODE_COMMAND;
		const childProcess = spawn(executableCommand, args, {
			stdio: "pipe",
			shell: true,
		});

		this.__store.dispatch(
			actions.setCaseHashInProgress(message.caseHashDigest),
		);

		const executionErrors: ExecutionError[] = [];

		childProcess.stderr.on("data", (chunk: unknown) => {
			if (!(chunk instanceof Buffer)) {
				return;
			}

			try {
				const stringifiedChunk = chunk.toString();

				const json = JSON.parse(stringifiedChunk);

				const validation = executionErrorCodec.decode(json);

				if (E.isLeft(validation)) {
					throw new Error(
						`Could not validate the message error: ${stringifiedChunk}`,
					);
				}

				executionErrors.push(validation.right);
			} catch (error) {
				console.error(error);
			}
		});

		const caseHashDigest = message.caseHashDigest;
		const codemodName = message.command.name;

		this.#execution = {
			childProcess,
			halted: false,
			totalFileCount: 0, // that is the lower bound,
			affectedAnyFile: false,
			jobs: [],
			targetUri: message.targetUri,
			happenedAt: message.happenedAt,
			case: {
				hash: caseHashDigest,
				codemodName: message.command.name,
				codemodHashDigest:
					"codemodHash" in message.command
						? message.command.codemodHash ?? undefined
						: undefined,
				createdAt: Number(message.happenedAt),
				path: message.targetUri.fsPath,
			},
			codemodHash:
				"codemodHash" in message.command ? message.command.codemodHash : null,
		};

		const interfase = readline.createInterface(childProcess.stdout);

		let timer: NodeJS.Timeout | null = null;

		interfase.on("line", async (line) => {
			if (timer !== null) {
				clearTimeout(timer);
			}

			timer = setTimeout(() => {
				childProcess.kill();
			}, TERMINATE_IDLE_PROCESS_TIMEOUT);

			if (!this.#execution) {
				return;
			}

			const either = messageCodec.decode(JSON.parse(line));

			if (either._tag === "Left") {
				const report = prettyReporter.report(either);

				console.error(report);
				return;
			}

			const message = verboseEngineMessage(either.right);

			if ("k" in message) {
				return;
			}

			if (message.kind === "progress") {
				this.#messageBus.publish({
					kind: MessageKind.showProgress,
					codemodHash: this.#execution.codemodHash ?? null,
					progressKind:
						this.#execution.codemodHash === "QKEdp-pofR9UnglrKAGDm1Oj6W0" // app router boilerplate
							? "infinite"
							: "finite",
					totalFileNumber: message.totalFileNumber,
					processedFileNumber: message.processedFileNumber,
				});
				this.#execution.totalFileCount = message.totalFileNumber;
				return;
			}

			if (message.kind === "finish") {
				return;
			}

			let job: Job;

			if (message.kind === "create") {
				const newUri = Uri.file(message.newFilePath);
				const newContentUri = Uri.file(message.newContentPath);

				const hashlessJob: Omit<Job, "hash"> = {
					kind: JobKind.createFile,
					oldUri: null,
					newUri,
					newContentUri,
					originalNewContent: readFileSync(newContentUri.fsPath).toString(
						"utf8",
					),
					codemodName,
					createdAt: Date.now(),
					caseHashDigest,
				};

				job = {
					...hashlessJob,
					hash: buildJobHash(hashlessJob, caseHashDigest),
				};
			} else if (message.kind === "rewrite") {
				const oldUri = Uri.file(message.oldPath);
				const newContentUri = Uri.file(message.newDataPath);

				const hashlessJob: Omit<Job, "hash"> = {
					kind: JobKind.rewriteFile,
					oldUri,
					newUri: oldUri,
					newContentUri,
					originalNewContent: readFileSync(newContentUri.fsPath).toString(
						"utf8",
					),
					codemodName,
					createdAt: Date.now(),
					caseHashDigest,
				};

				job = {
					...hashlessJob,
					hash: buildJobHash(hashlessJob, caseHashDigest),
				};
			} else if (message.kind === "delete") {
				const oldUri = Uri.file(message.oldFilePath);

				const hashlessJob: Omit<Job, "hash"> = {
					kind: JobKind.deleteFile,
					oldUri,
					newUri: null,
					newContentUri: null,
					originalNewContent: null,
					codemodName,
					createdAt: Date.now(),
					caseHashDigest,
				};

				job = {
					...hashlessJob,
					hash: buildJobHash(hashlessJob, caseHashDigest),
				};
			} else if (message.kind === "move") {
				const oldUri = Uri.file(message.oldFilePath);
				const newUri = Uri.file(message.newFilePath);

				const hashlessJob: Omit<Job, "hash"> = {
					kind: JobKind.moveFile,
					oldUri,
					newUri,
					newContentUri: oldUri,
					originalNewContent: readFileSync(oldUri.fsPath).toString("utf8"),
					codemodName,
					createdAt: Date.now(),
					caseHashDigest,
				};

				job = {
					...hashlessJob,
					hash: buildJobHash(hashlessJob, caseHashDigest),
				};
			} else if (message.kind === "copy") {
				const oldUri = Uri.file(message.oldFilePath);
				const newUri = Uri.file(message.newFilePath);

				const hashlessJob: Omit<Job, "hash"> = {
					kind: JobKind.copyFile,
					oldUri,
					newUri,
					newContentUri: oldUri,
					originalNewContent: readFileSync(oldUri.fsPath).toString("utf8"),
					codemodName,
					createdAt: Date.now(),
					caseHashDigest,
				};

				job = {
					...hashlessJob,
					hash: buildJobHash(hashlessJob, caseHashDigest),
				};
			} else {
				throw new Error("Unrecognized message");
			}

			if (job && !this.#execution.affectedAnyFile) {
				this.#execution.affectedAnyFile = true;
			}

			this.#execution.jobs.push(job);

			this.#messageBus.publish({
				kind: MessageKind.upsertCase,
				kase: this.#execution.case,
				jobs: [job],
			});
		});

		interfase.on("close", async () => {
			if (this.#execution) {
				this.#messageBus.publish({
					kind: MessageKind.codemodSetExecuted,
					halted: this.#execution.halted,
					fileCount: this.#execution.totalFileCount,
					jobs: this.#execution.jobs,
					case: this.#execution.case,
					executionErrors,
				});

				this.__store.dispatch(
					actions.setSelectedCaseHash(this.#execution.case.hash),
				);

				this.__store.dispatch(actions.setCaseHashInProgress(null));

				this.__store.dispatch(
					actions.setExplorerNodes([
						this.#execution.case.hash,
						workspace.workspaceFolders?.[0]?.uri.fsPath ?? "",
					]),
				);

				commands.executeCommand("codemodMainView.focus");

				if (!this.#execution.halted && !this.#execution.affectedAnyFile) {
					window.showWarningMessage(Messages.noAffectedFiles);
				}
			}

			this.#execution = null;

			const nextMessage = this.__executionMessageQueue.shift() ?? null;

			if (nextMessage === null) {
				return;
			}

			this.#onExecuteCodemodSetMessage(nextMessage);

			this.#messageBus.publish({
				kind: MessageKind.executionQueueChange,
				queuedCodemodHashes: this.__getQueuedCodemodHashes(),
			});
		});
	}

	async clearOutputFiles(storageUri: Uri) {
		const outputUri = Uri.joinPath(storageUri, "codemod-engine-node");

		await this.#fileSystem.delete(outputUri, {
			recursive: true,
			useTrash: false,
		});
	}
}
