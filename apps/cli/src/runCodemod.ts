import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import type { Filemod } from "@codemod-com/filemod";
import { type FileSystemAdapter, glob, globStream } from "fast-glob";
import * as yaml from "js-yaml";
import { type IFs, Volume, createFsFromVolume } from "memfs";
import { buildFileCommands } from "./buildFileCommands.js";
import { buildFileMap } from "./buildFileMap.js";
import type { Codemod } from "./codemod.js";
import {
	type FormattedFileCommand,
	buildFormattedFileCommands,
	modifyFileSystemUponCommand,
} from "./fileCommands.js";
import { getTransformer, transpile } from "./getTransformer.js";
import type { OperationMessage } from "./messages.js";
import type { PrinterBlueprint } from "./printer.js";
import { astGrepLanguageToPatterns } from "./runAstgrepCodemod.js";
import { type Dependencies, runRepomod } from "./runRepomod.js";
import type { SafeArgumentRecord } from "./safeArgumentRecord.js";
import type { FlowSettings } from "./schemata/flowSettingsSchema.js";
import type { RunSettings } from "./schemata/runArgvSettingsSchema.js";
import { WorkerThreadManager } from "./workerThreadManager.js";
import type { WorkerThreadMessage } from "./workerThreadMessages.js";

export { escape } from "minimatch";

const TERMINATE_IDLE_THREADS_TIMEOUT = 30 * 1000;

export const buildPatterns = async (
	flowSettings: FlowSettings,
	codemod: Codemod,
	filemod: Filemod<Dependencies, Record<string, unknown>> | null,
	printer: PrinterBlueprint,
): Promise<{
	include: string[];
	exclude: string[];
}> => {
	const formatFunc = (pattern: string) => {
		if (pattern.startsWith("**")) {
			return pattern;
		}

		if (pattern.startsWith("/")) {
			return `**${pattern}`;
		}

		return `**/${pattern}`;
	};

	const excludePatterns = flowSettings.exclude ?? [];
	const formattedExclude = excludePatterns.map(formatFunc);

	const files = flowSettings.files;

	if (files) {
		return {
			include: files,
			exclude: formattedExclude,
		};
	}

	let patterns = flowSettings.include ?? codemod.include;

	// ast-grep only runs on certain file and to oevrride that behaviour we would have to create temporary sgconfig file
	if (codemod.engine === "ast-grep") {
		if (patterns) {
			printer.printConsoleMessage(
				"info",
				"Ignoring include/exclude patterns for ast-grep codemod",
			);
			patterns = undefined;
		}

		try {
			const config = yaml.load(
				await readFile(codemod.indexPath, { encoding: "utf8" }),
			) as { language: string };
			patterns = astGrepLanguageToPatterns[config.language];
		} catch (error) {
			//
		}
	}

	if (!patterns) {
		if (codemod.engine === "filemod" && filemod !== null) {
			patterns = (filemod?.includePatterns as string[]) ?? ["**/*"];
		} else if (
			codemod.engine === "jscodeshift" ||
			codemod.engine === "ts-morph"
		) {
			patterns = ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"];
		}

		if (!patterns) {
			patterns = ["**/*"];
		}
	}

	// Prepend the pattern with "**/" if user didn't specify it, so that we cover more files that user wants us to
	const formattedInclude = patterns.map(formatFunc);

	return {
		include: formattedInclude,
		exclude: formattedExclude,
	};
};

export const buildPathsGlob = async (
	fileSystem: IFs,
	flowSettings: FlowSettings,
	patterns: {
		include: string[];
		exclude: string[];
	},
) => {
	const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

	return glob(patterns.include, {
		absolute: true,
		cwd: flowSettings.target,
		fs: fileSystemAdapter,
		ignore: patterns.exclude,
		onlyFiles: true,
		dot: true,
	});
};

async function* buildPathGlobGenerator(
	fileSystem: IFs,
	flowSettings: FlowSettings,
	patterns: {
		include: string[];
		exclude: string[];
	},
): AsyncGenerator<string, void, unknown> {
	const fileSystemAdapter = fileSystem as Partial<FileSystemAdapter>;

	const stream = globStream(patterns.include, {
		absolute: true,
		cwd: flowSettings.target,
		fs: fileSystemAdapter,
		ignore: patterns.exclude,
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
			for (let i = 0; i < codemod.codemods.length; ++i) {
				const commands: FormattedFileCommand[] = [];

				const subCodemod = codemod.codemods[i]!;

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

						if (message.kind === "progress") {
							onPrinterMessage({
								kind: "progress",
								recipeCodemodName:
									subCodemod.source === "package" ? subCodemod.name : undefined,
								processedFileNumber:
									message.totalFileNumber * i + message.processedFileNumber,
								totalFileNumber:
									message.totalFileNumber * codemod.codemods.length,
								processedFileName: message.processedFileName,
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
					await modifyFileSystemUponCommand(fileSystem, runSettings, command);
				}
			}

			return;
		}

		const mfs = createFsFromVolume(Volume.fromJSON({}));

		const paths = await buildPatterns(flowSettings, codemod, null, printer);

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
							processedFileName: message.processedFileName,
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

		const newPaths = await glob(paths.include, {
			absolute: true,
			cwd: flowSettings.target,
			ignore: paths.exclude,
			// @ts-expect-error type inconsistency
			fs: mfs,
			onlyFiles: true,
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

	if (codemod.engine === "filemod") {
		const transformer = getTransformer(transpiledSource);

		if (transformer === null) {
			throw new Error(
				`The transformer cannot be null: ${codemod.indexPath} ${codemod.engine}`,
			);
		}

		const patterns = await buildPatterns(
			flowSettings,
			codemod,
			transformer as Filemod<Dependencies, Record<string, unknown>>,
			printer,
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

	// jscodeshift or ts-morph or ast-grep
	const patterns = await buildPatterns(flowSettings, codemod, null, printer);
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
				if (message.kind === "progress") {
					onPrinterMessage({
						kind: "progress",
						processedFileNumber: message.processedFileNumber,
						totalFileNumber: message.totalFileNumber,
						processedFileName: relative(
							flowSettings.target,
							message.processedFileName,
						),
					});
				} else {
					onPrinterMessage(message);
				}

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
