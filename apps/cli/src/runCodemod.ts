import { Filemod } from "@codemod-com/filemod";
import { FileSystemAdapter, glob, globStream } from "fast-glob";
import { IFs, Volume, createFsFromVolume } from "memfs";
import { buildFileCommands } from "./buildFileCommands.js";
import { buildFileMap } from "./buildFileMap.js";
import { Codemod } from "./codemod.js";
import {
	FormattedFileCommand,
	buildFormattedFileCommands,
	modifyFileSystemUponCommand,
} from "./fileCommands.js";
import { getTransformer, transpile } from "./getTransformer.js";
import { OperationMessage } from "./messages.js";
import { PrinterBlueprint } from "./printer.js";
import { runAstgrep } from "./runAstgrepCodemod.js";
import { Dependencies, runRepomod } from "./runRepomod.js";
import { SafeArgumentRecord } from "./safeArgumentRecord.js";
import { FlowSettings } from "./schemata/flowSettingsSchema.js";
import { RunSettings } from "./schemata/runArgvSettingsSchema.js";
import { WorkerThreadManager } from "./workerThreadManager.js";
import { WorkerThreadMessage } from "./workerThreadMessages.js";

export { escape } from "minimatch";

const TERMINATE_IDLE_THREADS_TIMEOUT = 30 * 1000;

export const buildPatterns = async (
	flowSettings: FlowSettings,
	codemod: Codemod,
	filemod: Filemod<Dependencies, Record<string, unknown>> | null,
): Promise<string[]> => {
	let patterns = flowSettings.files ?? flowSettings.include ?? codemod.include;

	if (!patterns) {
		if (
			(codemod.engine === "repomod-engine" || codemod.engine === "filemod") &&
			filemod !== null
		) {
			patterns = (filemod?.includePatterns as string[]) ?? ["**/*"];
		} else if (codemod.engine === "jscodeshift") {
			patterns = ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"];
		} else if (codemod.engine === "ts-morph") {
			patterns = ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"];
		}

		if (!patterns) {
			patterns = ["**/*"];
		}
	}

	return patterns;
};

export const buildPathsGlob = async (
	fileSystem: IFs,
	flowSettings: FlowSettings,
	patterns: string[],
) => {
	const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

	// Prepend the pattern with "**/" if user didn't specify it, so that we cover more files that user wants us to
	const patternsFormatted = patterns.map((pattern) =>
		pattern.startsWith("**/") ? pattern : `**/${pattern}`,
	);

	return glob(patternsFormatted, {
		absolute: true,
		cwd: flowSettings.target,
		fs: fileSystemAdapter,
		ignore: flowSettings.exclude.slice(),
		onlyFiles: true,
		dot: true,
	});
};

async function* buildPathGlobGenerator(
	fileSystem: IFs,
	flowSettings: FlowSettings,
	patterns: string[],
): AsyncGenerator<string, void, unknown> {
	const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

	// Prepend the pattern with "**/" if user didn't specify it, so that we cover more files that user wants us to
	const patternsFormatted = patterns.map((pattern) =>
		pattern.startsWith("**/") ? pattern : `**/${pattern}`,
	);

	const stream = globStream(patternsFormatted, {
		absolute: true,
		cwd: flowSettings.target,
		fs: fileSystemAdapter,
		ignore: flowSettings.exclude.slice(),
		onlyFiles: true,
		dot: true,
	});

	for await (const chunk of stream) {
		yield chunk.toString();
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

		const paths = await buildPatterns(flowSettings, codemod, null);

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

	if (codemod.engine === "ast-grep") {
		await runAstgrep(printer, codemod.yamlPath, flowSettings.target);
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
		const patterns = await buildPatterns(
			flowSettings,
			codemod,
			transformer as Filemod<Dependencies, Record<string, unknown>>,
		);

		const globPaths = await buildPathsGlob(fileSystem, flowSettings, patterns);

		const fileCommands = await runRepomod(
			fileSystem,
			{ ...transformer, includePatterns: globPaths, excludePatterns: [] },
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
	const patterns = await buildPatterns(flowSettings, codemod, null);
	const pathGenerator = buildPathGlobGenerator(
		fileSystem,
		flowSettings,
		patterns,
	);

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
