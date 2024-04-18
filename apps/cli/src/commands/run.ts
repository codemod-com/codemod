import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { TelemetrySender } from "@codemod-com/telemetry";
import { parseCodemodConfig } from "@codemod-com/utilities";
import { AxiosError } from "axios";
import type { IFs } from "memfs";
import terminalLink from "terminal-link";
import { buildSourcedCodemodOptions } from "../buildCodemodOptions.js";
import type { buildRunOptions } from "../buildOptions.js";
import { CodemodDownloader } from "../downloadCodemod.js";
import { FileDownloadService } from "../fileDownloadService.js";
import { handleInstallDependencies } from "../handleInstallDependencies.js";
import type { PrinterBlueprint } from "../printer.js";
import { loadRepositoryConfiguration } from "../repositoryConfiguration.js";
import { type CodemodToRun, Runner } from "../runner.js";
import { buildSafeArgumentRecord } from "../safeArgumentRecord.js";
import { parseCodemodSettings } from "../schemata/codemodSettingsSchema.js";
import { parseFlowSettings } from "../schemata/flowSettingsSchema.js";
import { parseRunSettings } from "../schemata/runArgvSettingsSchema.js";
import { TarService } from "../services/tarService.js";
import type { TelemetryEvent } from "../telemetry.js";
import { boldText } from "../utils.js";

export const handleRunCliCommand = async (
	printer: PrinterBlueprint,
	args: Awaited<ReturnType<ReturnType<typeof buildRunOptions>>["argv"]>,
	telemetry: TelemetrySender<TelemetryEvent>,
) => {
	const nameOrPath = String(args._.at(-1));

	if (existsSync(nameOrPath)) {
		args.source = nameOrPath;
	}

	const codemodSettings = parseCodemodSettings(args);
	const argvFlags = parseFlowSettings(args);
	const runSettings = parseRunSettings(homedir(), args);

	const fileDownloadService = new FileDownloadService(
		args.noCache,
		fs,
		printer,
	);

	const tarService = new TarService(fs as unknown as IFs);

	const configurationDirectoryPath = join(
		String(args._) === "runOnPreCommit" ? process.cwd() : homedir(),
		".codemod",
	);

	const codemodDownloader = new CodemodDownloader(
		printer,
		configurationDirectoryPath,
		args.noCache,
		fileDownloadService,
		tarService,
	);

	const codemods: CodemodToRun[] = [];

	if (codemodSettings.kind === "runSourced") {
		const codemod = await buildSourcedCodemodOptions(
			fs,
			printer,
			codemodSettings,
			codemodDownloader,
		);

		codemods.push({
			...codemod,
			hashDigest: createHash("ripemd160")
				.update(codemodSettings.source)
				.digest(),
			safeArgumentRecord: buildSafeArgumentRecord(codemod, argvFlags),
		});
	} else if (codemodSettings.kind === "runNamed") {
		let codemod: Awaited<ReturnType<typeof codemodDownloader.download>>;
		try {
			codemod = await codemodDownloader.download(nameOrPath);
		} catch (error) {
			if (error instanceof AxiosError) {
				if (
					error.response?.status === 400 &&
					error.response.data.error === "Codemod not found"
				) {
					printer.printConsoleMessage(
						"error",
						// biome-ignore lint: readability reasons
						"The specified command or codemod name could not be recognized.\n" +
							`To view available commands, execute ${boldText(
								`"codemod --help"`,
							)}.\n` +
							`To see a list of existing codemods, run ${boldText(
								`"codemod search"`,
							)} or ${boldText(
								`"codemod list"`,
							)} with a query representing the codemod you are looking for.`,
					);

					process.exit(1);
				}
			}

			throw new Error(`Error while downloading codemod ${name}: ${error}`);
		}

		codemods.push({
			...codemod,
			hashDigest: createHash("ripemd160").update(codemod.name).digest(),
			safeArgumentRecord: buildSafeArgumentRecord(codemod, argvFlags),
		});
	} else {
		const { preCommitCodemods } = await loadRepositoryConfiguration();

		for (const preCommitCodemod of preCommitCodemods) {
			if (preCommitCodemod.source === "package") {
				const codemod = await codemodDownloader.download(preCommitCodemod.name);
				codemods.push({
					...codemod,
					safeArgumentRecord: buildSafeArgumentRecord(
						codemod,
						preCommitCodemod.arguments,
					),
				});
			}
		}
	}

	const runner = new Runner(codemods, fs, printer, runSettings, argvFlags);

	if (runSettings.dryRun) {
		printer.printConsoleMessage(
			"log",
			terminalLink(
				"Click to view the live results of this run in the Codemod VSCode Extension!",
				`vscode://codemod.codemod-vscode-extension/cases/${runSettings.caseHashDigest.toString(
					"base64url",
				)}`,
			),
		);
	}

	const depsToInstall: Record<
		string,
		{ deps: string[]; affectedFiles: string[] }
	> = {};

	await runner.run(
		async (codemod, filePaths) => {
			let codemodName = "Standalone codemod (from user machine)";

			if (codemod.source === "package") {
				if (codemodSettings.kind === "runSourced") {
					codemodName = `${codemod.name} (from user machine)`;
				} else {
					codemodName = codemod.name;
				}

				const rcFileString = await readFile(
					join(codemod.directoryPath, ".codemodrc.json"),
					{ encoding: "utf8" },
				);
				const rcFile = parseCodemodConfig(JSON.parse(rcFileString));

				if (rcFile.deps) {
					depsToInstall[codemodName] = {
						affectedFiles: filePaths,
						deps: rcFile.deps,
					};
				}
			}

			telemetry.sendEvent({
				kind: "codemodExecuted",
				codemodName,
				executionId: runSettings.caseHashDigest.toString("base64url"),
				fileCount: filePaths.length,
			});
		},
		(error) => {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: "error",
				message: `Error while running the codemod:\n${error.message}`,
			});
			telemetry.sendEvent({
				kind: "failedToExecuteCommand",
				commandName: "codemod.executeCodemod",
			});
		},
	);

	if (runSettings.dryRun) {
		printer.printConsoleMessage(
			"log",
			terminalLink(
				"The run has finished! Click to open the Codemod VSCode Extension and view the results.",
				`vscode://codemod.codemod-vscode-extension/cases/${runSettings.caseHashDigest.toString(
					"base64url",
				)}`,
			),
		);
	}

	if (!runSettings.dryRun && !argvFlags.skipInstall) {
		for (const [codemodName, { deps, affectedFiles }] of Object.entries(
			depsToInstall,
		)) {
			await handleInstallDependencies({
				codemodName,
				printer,
				affectedFiles,
				target: argvFlags.target,
				deps,
			});
		}
	}
};
