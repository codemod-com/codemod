import { Filemod } from "@codemod-com/filemod";
import { FileSystemAdapter, glob, globStream } from "fast-glob";
import { createFsFromVolume, IFs, Volume } from "memfs";
import { buildFileCommands } from "./buildFileCommands.js";
import { buildFileMap } from "./buildFileMap.js";
import { Codemod } from "./codemod.js";
import {
	buildFormattedFileCommands,
	FormattedFileCommand,
	modifyFileSystemUponCommand,
} from "./fileCommands.js";
import { getTransformer, transpile } from "./getTransformer.js";
import { OperationMessage } from "./messages.js";
import { PrinterBlueprint } from "./printer.js";
import { Dependencies, runRepomod } from "./runRepomod.js";
import { SafeArgumentRecord } from "./safeArgumentRecord.js";
import { FlowSettings } from "./schemata/flowSettingsSchema.js";
import { RunSettings } from "./schemata/runArgvSettingsSchema.js";
import { WorkerThreadManager } from "./workerThreadManager.js";
import { WorkerThreadMessage } from "./workerThreadMessages.js";

export { escape } from "minimatch";

const TERMINATE_IDLE_THREADS_TIMEOUT = 30 * 1000;

export const buildPaths = async (
	fileSystem: IFs,
	flowSettings: FlowSettings,
	codemod: Codemod,
	filemod: Filemod<Dependencies, Record<string, unknown>> | null,
): Promise<ReadonlyArray<string>> => {
	const patterns = flowSettings.files ?? flowSettings.include ?? [];

	const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

	if (
		(codemod.engine === "repomod-engine" || codemod.engine === "filemod") &&
		filemod !== null
	) {
		const filemodPaths = await glob(filemod.includePatterns?.slice() ?? [], {
			absolute: true,
			cwd: flowSettings.target,
			ignore: filemod.excludePatterns?.slice(),
			onlyFiles: true,
			fs: fileSystemAdapter,
			dot: true,
		});

		const flowPaths = await glob(patterns.slice(), {
			absolute: true,
			cwd: flowSettings.target,
			ignore: flowSettings.exclude.slice(),
			onlyFiles: true,
			fs: fileSystemAdapter,
			dot: true,
		});

		return filemodPaths
			.filter((path) => flowPaths.includes(path))
			.slice(0, flowSettings.limit);
	}

	const paths = await glob(patterns.slice(), {
		absolute: true,
		cwd: flowSettings.target,
		fs: fileSystemAdapter,
		ignore: flowSettings.exclude.slice(),
		onlyFiles: true,
		dot: true,
	});

	return paths.slice(0, flowSettings.limit);
};

async function* buildPathGenerator(
	fileSystem: IFs,
	flowSettings: FlowSettings,
): AsyncGenerator<string, void, unknown> {
	const patterns = flowSettings.files ?? flowSettings.include ?? [];
	const ignore =
		flowSettings.files === undefined ? flowSettings.exclude.slice() : undefined;

	const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

	const stream = globStream(patterns.slice(), {
		absolute: true,
		cwd: flowSettings.target,
		fs: fileSystemAdapter,
		ignore,
		onlyFiles: true,
		dot: true,
	});

	let fileCount = 0;

	for await (const chunk of stream) {
		if (fileCount >= flowSettings.limit) {
			break;
		}

		yield chunk.toString();

		++fileCount;
	}

	stream.emit("close");
}

export const runCodemod = async (
	fileSystem: IFs,
	printer: PrinterBlueprint,
	codemod: Codemod,
	flowSettings: FlowSettings,
	runSettings: RunSettings,
	onCommand: (command: FormattedFileCommand) => Promise<void>,
	onPrinterMessage: (
		message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
	) => void,
	safeArgumentRecord: SafeArgumentRecord,
	currentWorkingDirectory: string,
	getCodemodSource: (path: string) => Promise<string>,
): Promise<void> => {
	const name = "name" in codemod ? codemod.name : codemod.indexPath;

	printer.printConsoleMessage(
		"info",
		`Running the "${name}" codemod using "${codemod.engine}"`,
	);

	if (codemod.engine === "piranha") {
		throw new Error("Piranha not supported");
	}

	if (codemod.engine === "recipe") {
		if (!runSettings.dryRun) {
			for (const subCodemod of codemod.codemods) {
				const commands: FormattedFileCommand[] = [];

				await runCodemod(
					fileSystem,
					printer,
					subCodemod,
					flowSettings,
					runSettings,
					async (command) => {
						commands.push(command);
					},
					(message) => {
						if (message.kind === "error") {
							onPrinterMessage(message);
						}
						// we are discarding any printer messages from subcodemods
						// if we are within a recipe
					},
					safeArgumentRecord,
					currentWorkingDirectory,
					getCodemodSource,
				);

				for (const command of commands) {
					await modifyFileSystemUponCommand(fileSystem, runSettings, command);
				}
			}

			return;
		}

		const mfs = createFsFromVolume(Volume.fromJSON({}));

		const paths = await buildPaths(fileSystem, flowSettings, codemod, null);

		const fileMap = await buildFileMap(fileSystem, mfs, paths);

		const deletedPaths: string[] = [];

		for (let i = 0; i < codemod.codemods.length; ++i) {
			const subCodemod = codemod.codemods[i]!;

			const commands: FormattedFileCommand[] = [];

			await runCodemod(
				mfs,
				printer,
				subCodemod,
				flowSettings,
				{
					dryRun: false,
					caseHashDigest: runSettings.caseHashDigest,
				},
				async (command) => {
					commands.push(command);
				},
				(message) => {
					if (message.kind === "error") {
						onPrinterMessage(message);
					}

					if (message.kind === "progress") {
						onPrinterMessage({
							kind: "progress",
							processedFileNumber:
								message.totalFileNumber * i + message.processedFileNumber,
							totalFileNumber:
								message.totalFileNumber * codemod.codemods.length,
						});
					}

					// we are discarding any printer messages from subcodemods
					// if we are within a recipe
				},
				safeArgumentRecord,
				currentWorkingDirectory,
				getCodemodSource,
			);

			for (const command of commands) {
				if (command.kind === "deleteFile") {
					deletedPaths.push(command.oldPath);
				}

				await modifyFileSystemUponCommand(
					mfs,
					{
						dryRun: false,
						caseHashDigest: runSettings.caseHashDigest,
					},
					command,
				);
			}
		}

		const patterns = flowSettings.files ?? flowSettings.include ?? [];

		const newPaths = await glob(patterns.slice(), {
			absolute: true,
			cwd: flowSettings.target,
			// @ts-expect-error type inconsistency
			fs: mfs,
			nodir: true,
		});

		const fileCommands = await buildFileCommands(
			fileMap,
			newPaths,
			deletedPaths,
			mfs,
		);

		const commands = await buildFormattedFileCommands(fileCommands);

		for (const command of commands) {
			await onCommand(command);
		}

		return;
	}

	const codemodSource = await getCodemodSource(codemod.indexPath);

	const transpiledSource = codemod.indexPath.endsWith(".ts")
		? transpile(codemodSource.toString())
		: codemodSource.toString();

	const transformer = getTransformer(transpiledSource);

	if (transformer === null) {
		throw new Error(
			`The transformer cannot be null: ${codemod.indexPath} ${codemod.engine}`,
		);
	}

	if (codemod.engine === "repomod-engine" || codemod.engine === "filemod") {
		const paths = await buildPaths(
			fileSystem,
			flowSettings,
			codemod,
			transformer as Filemod<Dependencies, Record<string, unknown>>,
		);

		const fileCommands = await runRepomod(
			fileSystem,
			{ ...transformer, includePatterns: paths, excludePatterns: [] },
			flowSettings.target,
			flowSettings.raw,
			safeArgumentRecord,
			onPrinterMessage,
			currentWorkingDirectory,
		);

		const commands = await buildFormattedFileCommands(fileCommands);

		for (const command of commands) {
			await onCommand(command);
		}

		return;
	}

	// jscodeshift or ts-morph
	const pathGenerator = buildPathGenerator(fileSystem, flowSettings);

	const { engine } = codemod;

	await new Promise<void>((resolve) => {
		let timeout: NodeJS.Timeout | null = null;

		const workerThreadManager = new WorkerThreadManager(
			flowSettings.threads,
			async (path) => {
				const data = await fileSystem.promises.readFile(path, {
					encoding: "utf8",
				});

				return data as string;
			},
			(message) => {
				onPrinterMessage(message);

				if (timeout) {
					clearTimeout(timeout);
				}

				if (message.kind === "finish") {
					resolve();

					return;
				}

				timeout = setTimeout(async () => {
					await workerThreadManager.terminateWorkers();

					resolve();
				}, TERMINATE_IDLE_THREADS_TIMEOUT);
			},
			onCommand,
			pathGenerator,
			codemod.indexPath,
			engine,
			transpiledSource,
			flowSettings.raw,
			safeArgumentRecord,
		);
	});
};
