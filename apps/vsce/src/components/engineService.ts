import {
	type ChildProcess,
	type ChildProcessWithoutNullStreams,
	exec,
	execSync,
	spawn,
} from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as readline from 'node:readline';
import axios from 'axios';
import * as E from 'fp-ts/Either';
import { type FileSystem, Uri, commands, window } from 'vscode';
import type { Case } from '../cases/types';
import type { CodemodEntry, CodemodListResponse } from '../codemods/types';
import type { Configuration } from '../configuration';
import type { Container } from '../container';
import type { Store } from '../data';
import { actions } from '../data/slice';
import { type ExecutionError, executionErrorCodec } from '../errors/types';
import type { CodemodHash } from '../packageJsonAnalyzer/types';
import {
	buildCrossplatformArg,
	isNeitherNullNorUndefined,
	streamToString,
} from '../utilities';
import { buildArguments } from './buildArguments';
import { type Message, type MessageBus, MessageKind } from './messageBus';

export class EngineNotFoundError extends Error {}
export class UnableToParseEngineResponseError extends Error {}
export class InvalidEngineResponseFormatError extends Error {}

export let Messages = {
	noAffectedFiles:
		'The codemod has run successfully but didn’t do anything' as const,
	noImportedMod: 'No imported codemod was found' as const,
};

let TERMINATE_IDLE_PROCESS_TIMEOUT = 30 * 1000;

export enum EngineMessageKind {
	finish = 2,
	rewrite = 3,
	progress = 6,
	delete = 7,
	move = 8,
	create = 9,
	copy = 10,
}

type EngineMessage =
	| {
			kind: 'progress';
			codemodName: string | undefined;
			processedFileNumber: number;
			totalFileNumber: number;
			processedFileName: string | null;
	  }
	| { kind: 'finish' };

type Execution = {
	readonly childProcess: ChildProcessWithoutNullStreams;
	readonly codemodHash: CodemodHash | null;
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

let CODEMOD_ENGINE_NODE_COMMAND = 'codemod';
let CODEMOD_ENGINE_NODE_POLLING_INTERVAL = 1250;
let CODEMOD_ENGINE_NODE_POLLING_ITERATIONS_LIMIT = 200;

export let getCodemodList = async (): Promise<CodemodListResponse> => {
	let url = new URL('https://backend.codemod.com/codemods/list');

	let res = await axios.get<CodemodListResponse>(url.toString(), {
		timeout: 10000,
	});

	return res.data;
};

let buildCodemodEntry = (
	codemod: CodemodListResponse[number],
): CodemodEntry => {
	let hashDigest = createHash('ripemd160')
		.update(codemod.name)
		.digest('base64url');

	return {
		...(codemod ?? {}),
		kind: 'codemod' as const,
		hashDigest,
	};
};

export class EngineService {
	readonly #configurationContainer: Container<Configuration>;
	readonly #fileSystem: FileSystem;
	readonly #messageBus: MessageBus;

	#execution: Execution | null = null;
	__fetchCodemodsIntervalId: NodeJS.Timer | null = null;
	private __codemodEngineRustExecutableUri: Uri | null = null;
	private __executionMessageQueue: ExecuteCodemodMessage[] = [];

	public constructor(
		configurationContainer: Container<Configuration>,
		messageBus: MessageBus,
		fileSystem: FileSystem,
		private readonly __store: Store,
		private readonly __rootPath: string | null,
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

	private async __getNumberOfAffectedFiles(): Promise<number> {
		if (this.__rootPath === null) {
			return 0;
		}

		let childProcess = exec('git diff --name-only', {
			cwd: this.__rootPath,
			timeout: 3000,
		});

		if (childProcess.stdout === null) {
			return 0;
		}

		let output = await streamToString(childProcess.stdout);

		return output.split('\n').length;
	}

	private async __pollCodemodEngineNode() {
		let iterations = 0;

		let checkCodemodEngineNode = async () => {
			if (iterations > CODEMOD_ENGINE_NODE_POLLING_ITERATIONS_LIMIT) {
				clearInterval(codemodEnginePollingIntervalId);
			}

			let codemodEngineNodeLocated =
				await this.isCodemodEngineNodeLocated();

			this.#messageBus.publish({
				kind: MessageKind.codemodEngineNodeLocated,
				codemodEngineNodeLocated,
			});

			if (codemodEngineNodeLocated) {
				this.__fetchCodemodsIntervalId = setInterval(
					this.__fetchCodemods,
					5 * 60 * 1000, // 5 mins
				);
				this.__fetchCodemods();
				clearInterval(codemodEnginePollingIntervalId);
			}

			iterations++;
		};

		// we retry codemod engine installation checks automatically, so we can detect when user installs the codemod
		let codemodEnginePollingIntervalId = setInterval(
			checkCodemodEngineNode,
			CODEMOD_ENGINE_NODE_POLLING_INTERVAL,
		);

		checkCodemodEngineNode();
	}

	async #onEnginesBootstrappedMessage(
		message: Message & { kind: MessageKind.engineBootstrapped },
	) {
		this.__codemodEngineRustExecutableUri =
			message.codemodEngineRustExecutableUri;
	}

	private __getCodemodEngineRustExecutableCommand() {
		if (this.__codemodEngineRustExecutableUri === null) {
			throw new Error('The engines are not bootstrapped.');
		}

		return buildCrossplatformArg(
			this.__codemodEngineRustExecutableUri.fsPath,
		);
	}

	private async __checkIfCodemodExists(childProcess: ChildProcess) {
		if (childProcess.stdout === null) {
			return false;
		}

		let output = await streamToString(childProcess.stdout);

		return output.includes('/codemod');
	}

	public async isCodemodEngineNodeLocated(): Promise<boolean> {
		let modulePaths = [];
		try {
			let path = execSync('npm root -g').toString().trim();
			modulePaths.push(path);
		} catch (err) {
			console.log(err);
		}
		try {
			let path = execSync('pnpm root -g').toString().trim();
			modulePaths.push(path);
		} catch (err) {
			console.log(err);
		}

		for (let path of modulePaths) {
			try {
				let pathExists = existsSync(join(path, 'codemod'));
				if (pathExists) {
					return true;
				}
			} catch (err) {
				console.log(err);
			}
		}

		let childProcess1 = exec('where codemod', { timeout: 3000 });
		let childProcess2 = exec('which codemod', { timeout: 3000 });

		let [exists1, exists2] = await Promise.all([
			this.__checkIfCodemodExists(childProcess1),
			this.__checkIfCodemodExists(childProcess2),
		]);

		return exists1 || exists2;
	}

	private async __fetchCodemods(): Promise<void> {
		try {
			let codemods = await getCodemodList();
			let codemodEntries = codemods.map(buildCodemodEntry);

			this.__store.dispatch(actions.setCodemods(codemodEntries));
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
		this.#execution.childProcess.kill('SIGINT');
		this.__fetchCodemodsIntervalId = null;
	}

	private __getQueuedCodemodHashes(): ReadonlyArray<CodemodHash> {
		return this.__executionMessageQueue
			.map(({ command }) =>
				'codemodHash' in command ? command.codemodHash : null,
			)
			.filter(isNeitherNullNorUndefined);
	}

	async #onExecuteCodemodSetMessage(
		message: Message & { kind: MessageKind.executeCodemodSet },
	) {
		if (this.#execution) {
			if (message.command.kind === 'executeCodemod') {
				this.__executionMessageQueue.push(
					message as ExecuteCodemodMessage,
				);

				this.#messageBus.publish({
					kind: MessageKind.executionQueueChange,
					queuedCodemodHashes: this.__getQueuedCodemodHashes(),
				});

				return;
			}

			await window.showErrorMessage(
				'Wait until the previous codemod set execution has finished',
			);
			return;
		}

		let codemodHash =
			message.command.kind === 'executeCodemod' ||
			message.command.kind === 'executeLocalCodemod'
				? message.command.codemodHash
				: null;

		this.#messageBus.publish({
			kind: MessageKind.showProgress,
			codemodHash,
			progressKind: 'infinite',
			totalFileNumber: 0,
			processedFileNumber: 0,
		});

		let storageUri = Uri.joinPath(
			message.storageUri,
			'codemod-engine-node',
		);

		await this.#fileSystem.createDirectory(message.storageUri);
		await this.#fileSystem.createDirectory(storageUri);

		let args = buildArguments(
			this.#configurationContainer.get(),
			message,
			storageUri,
		);

		let executableCommand =
			message.command.kind === 'executePiranhaRule'
				? this.__getCodemodEngineRustExecutableCommand()
				: CODEMOD_ENGINE_NODE_COMMAND;
		let childProcess = spawn(executableCommand, args, {
			stdio: 'pipe',
			shell: true,
		});

		let executionErrors: ExecutionError[] = [];

		childProcess.stderr.on('data', (chunk: unknown) => {
			if (!(chunk instanceof Buffer)) {
				return;
			}

			try {
				let stringifiedChunk = chunk.toString();

				let json = JSON.parse(stringifiedChunk);

				let validation = executionErrorCodec.decode(json);

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

		let caseHashDigest = message.caseHashDigest;
		this.#execution = {
			childProcess,
			halted: false,
			totalFileCount: 0, // that is the lower bound,
			affectedAnyFile: false,
			targetUri: message.targetUri,
			happenedAt: message.happenedAt,
			case: {
				hash: caseHashDigest,
				codemodName: message.command.name,
				codemodHashDigest:
					'codemodHash' in message.command
						? message.command.codemodHash ?? undefined
						: undefined,
				createdAt: Number(message.happenedAt),
				path: message.targetUri.fsPath,
			},
			codemodHash:
				'codemodHash' in message.command
					? message.command.codemodHash
					: null,
		};

		let interfase = readline.createInterface(childProcess.stdout);

		let timer: NodeJS.Timeout | null = null;

		let initialNumberOfAffectedFiles =
			await this.__getNumberOfAffectedFiles();

		interfase.on('line', async (line) => {
			if (timer !== null) {
				clearTimeout(timer);
			}

			timer = setTimeout(() => {
				childProcess.kill();
			}, TERMINATE_IDLE_PROCESS_TIMEOUT);

			if (!this.#execution) {
				return;
			}

			if (line.toLowerCase().includes('update available')) {
				// line will look like "│      Update available 0.11.2 > 0.11.5        │"
				window.showWarningMessage(
					`${line.replaceAll(
						'│',
						'',
					)}. Run "npm i -g codemod@latest" to upgrade.`,
				);
			}

			let message = JSON.parse(line) as EngineMessage;

			if (!message.kind) {
				return;
			}

			if (message.kind === 'progress') {
				this.#messageBus.publish({
					kind: MessageKind.showProgress,
					codemodHash: this.#execution.codemodHash ?? null,
					progressKind:
						message.totalFileNumber && message.processedFileNumber
							? 'finite'
							: 'infinite',
					totalFileNumber: message.totalFileNumber,
					processedFileNumber: message.processedFileNumber,
				});
				this.#execution.totalFileCount = message.totalFileNumber;

				if (message.totalFileNumber !== message.processedFileNumber) {
					return;
				}
				this.#execution.affectedAnyFile =
					(await this.__getNumberOfAffectedFiles()) >
					initialNumberOfAffectedFiles;
				if (this.#execution) {
					this.#messageBus.publish({
						kind: MessageKind.codemodSetExecuted,
						halted: this.#execution.halted,
						fileCount: this.#execution.totalFileCount,
						case: this.#execution.case,
						executionErrors,
					});

					if (
						this.#execution.affectedAnyFile &&
						this.__executionMessageQueue.length === 0
					) {
						setTimeout(() => {
							commands.executeCommand('workbench.view.scm');
						}, 500);
					}

					if (
						!this.#execution.affectedAnyFile &&
						!this.#execution.halted
					) {
						window.showWarningMessage(Messages.noAffectedFiles);
					}
				}

				this.#execution = null;

				let nextMessage = this.__executionMessageQueue.shift() ?? null;

				if (nextMessage === null) {
					return;
				}

				this.#onExecuteCodemodSetMessage(nextMessage);

				this.#messageBus.publish({
					kind: MessageKind.executionQueueChange,
					queuedCodemodHashes: this.__getQueuedCodemodHashes(),
				});

				return;
			}
		});
	}

	async clearOutputFiles(storageUri: Uri) {
		let outputUri = Uri.joinPath(storageUri, 'codemod-engine-node');

		await this.#fileSystem.delete(outputUri, {
			recursive: true,
			useTrash: false,
		});
	}
}
