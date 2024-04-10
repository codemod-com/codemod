import { createHash } from "crypto";
import { join } from "path";
import { parseCodemodConfig } from "@codemod-com/utilities";
import { AxiosError } from "axios";
import { readFile } from "fs/promises";
import type { IFs } from "memfs";
import terminalLink from "terminal-link";
import { buildSourcedCodemodOptions } from "./buildCodemodOptions.js";
import type { CodemodDownloaderBlueprint } from "./downloadCodemod.js";
import {
	type FormattedFileCommand,
	buildPrinterMessageUponCommand,
	modifyFileSystemUponCommand,
} from "./fileCommands.js";
import { handleInstallDependencies } from "./handleInstallDependencies.js";
import type { PrinterBlueprint } from "./printer.js";
import type { RepositoryConfiguration } from "./repositoryConfiguration.js";
import { runCodemod } from "./runCodemod.js";
import { buildSafeArgumentRecord } from "./safeArgumentRecord.js";
import type { CodemodSettings } from "./schemata/codemodSettingsSchema.js";
import type { FlowSettings } from "./schemata/flowSettingsSchema.js";
import { RunSettings } from "./schemata/runArgvSettingsSchema.js";
import { SurfaceAgnosticCaseService } from "./services/surfaceAgnosticCaseService.js";
import type { TelemetryBlueprint } from "./telemetryService.js";
import { boldText, colorizeText } from "./utils.js";

export class Runner {
	private __modifiedFilePaths: string[];

	public constructor(
		protected readonly _fs: IFs,
		protected readonly _printer: PrinterBlueprint,
		protected readonly _telemetry: TelemetryBlueprint,
		protected readonly _codemodDownloader: CodemodDownloaderBlueprint,
		protected readonly _loadRepositoryConfiguration: () => Promise<RepositoryConfiguration>,
		protected readonly _codemodSettings: CodemodSettings,
		protected readonly _flowSettings: FlowSettings,
		protected readonly _runSettings: RunSettings,
		// TODO: fix types
		protected readonly _argv: Record<string, string | number | boolean>,
		protected readonly _name: string | null,
		protected readonly _currentWorkingDirectory: string,
		protected readonly _getCodemodSource: (path: string) => Promise<string>,
	) {
		this.__modifiedFilePaths = [];
	}

	public async run() {
		const EXTENSION_LINK_START = terminalLink(
			"Click to view the live results of this run in the Codemod VSCode Extension!",
			`vscode://codemod.codemod-vscode-extension/cases/${this._runSettings.caseHashDigest.toString(
				"base64url",
			)}`,
		);

		const EXTENSION_LINK_END = terminalLink(
			"The run has finished! Click to open the Codemod VSCode Extension and view the results.",
			`vscode://codemod.codemod-vscode-extension/cases/${this._runSettings.caseHashDigest.toString(
				"base64url",
			)}`,
		);

		try {
			if (this._codemodSettings.kind === "runSourced") {
				const codemodOptions = await buildSourcedCodemodOptions(
					this._fs,
					this._printer,
					this._codemodSettings,
					this._codemodDownloader,
				);

				const safeArgumentRecord = buildSafeArgumentRecord(
					codemodOptions,
					this._argv,
				);

				const codemodHashDigest = createHash("ripemd160")
					.update(this._codemodSettings.source)
					.digest();

				const surfaceAgnosticCaseService = new SurfaceAgnosticCaseService(
					this._fs,
					this._runSettings,
					this._flowSettings,
					safeArgumentRecord,
					codemodHashDigest,
				);

				await surfaceAgnosticCaseService.emitPreamble();

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage("log", EXTENSION_LINK_START);
				}

				await runCodemod(
					this._fs,
					this._printer,
					codemodOptions,
					this._flowSettings,
					this._runSettings,
					async (command) => {
						await this._handleCommand(command);

						await surfaceAgnosticCaseService.emitJob(command);
					},
					(message) => this._printer.printMessage(message),
					safeArgumentRecord,
					this._currentWorkingDirectory,
					this._getCodemodSource,
				);

				await surfaceAgnosticCaseService.emitPostamble();

				this._telemetry.sendEvent({
					kind: "codemodExecuted",
					codemodName: "Codemod from FS",
					executionId: this._runSettings.caseHashDigest.toString("base64url"),
					fileCount: this.__modifiedFilePaths.length,
				});

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage("log", EXTENSION_LINK_END);
					return;
				}

				if (this._flowSettings.skipInstall) {
					return;
				}

				const rcFileString = await readFile(
					join(this._codemodSettings.source, ".codemodrc.json"),
					{ encoding: "utf8" },
				);
				const rcFile = parseCodemodConfig(JSON.parse(rcFileString));
				if (rcFile.deps) {
					await handleInstallDependencies({
						printer: this._printer,
						affectedFiles: this.__modifiedFilePaths,
						target: this._flowSettings.target,
						deps: rcFile.deps,
					});
				}

				return;
			}

			if (this._codemodSettings.kind === "runOnPreCommit") {
				const { preCommitCodemods } = await this._loadRepositoryConfiguration();

				for (const preCommitCodemod of preCommitCodemods) {
					if (preCommitCodemod.source === "package") {
						const codemod = await this._codemodDownloader.download(
							preCommitCodemod.name,
						);

						const safeArgumentRecord = buildSafeArgumentRecord(
							codemod,
							preCommitCodemod.arguments,
						);

						await runCodemod(
							this._fs,
							this._printer,
							codemod,
							this._flowSettings,
							this._runSettings,
							(command) => this._handleCommand(command),
							(message) => this._printer.printMessage(message),
							safeArgumentRecord,
							this._currentWorkingDirectory,
							this._getCodemodSource,
						);

						this._telemetry.sendEvent({
							kind: "codemodExecuted",
							codemodName: codemod.name,
							executionId:
								this._runSettings.caseHashDigest.toString("base64url"),
							fileCount: this.__modifiedFilePaths.length,
						});
					}
				}

				return;
			}

			if (this._name !== null) {
				let codemod: Awaited<
					ReturnType<typeof this._codemodDownloader.download>
				>;
				try {
					codemod = await this._codemodDownloader.download(this._name);
				} catch (error) {
					if (error instanceof AxiosError) {
						if (
							error.response?.status === 400 &&
							error.response.data.error === "Codemod not found"
						) {
							// Until we have distinction between `codemod` and `codemod run`, we don't want to throw and error here,
							// because it will get picked up by logic in runner.ts, which will prepend `Error while running the codemod`
							// to the error text. We just want to print the error and let user decide what to do for now.
							this._printer.printConsoleMessage(
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

				this._printer.printConsoleMessage(
					"info",
					colorizeText(
						`Executing the ${boldText(
							`"${this._name}"`,
						)} codemod against ${boldText(
							`"${this._flowSettings.target}"`,
						)} using ${boldText(`"${codemod.engine}"`)} engine...\n`,
						"cyan",
					),
				);

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage("log", EXTENSION_LINK_START);
				}

				const codemodHashDigest = createHash("ripemd160")
					.update(codemod.name)
					.digest();

				const safeArgumentRecord = buildSafeArgumentRecord(codemod, this._argv);

				const surfaceAgnosticCaseService = new SurfaceAgnosticCaseService(
					this._fs,
					this._runSettings,
					this._flowSettings,
					safeArgumentRecord,
					codemodHashDigest,
				);

				await surfaceAgnosticCaseService.emitPreamble();

				await runCodemod(
					this._fs,
					this._printer,
					codemod,
					this._flowSettings,
					this._runSettings,
					async (command) => {
						await this._handleCommand(command);

						await surfaceAgnosticCaseService.emitJob(command);
					},
					(message) => this._printer.printMessage(message),
					safeArgumentRecord,
					this._currentWorkingDirectory,
					this._getCodemodSource,
				);

				await surfaceAgnosticCaseService.emitPostamble();

				this._telemetry.sendEvent({
					kind: "codemodExecuted",
					codemodName: codemod.name,
					executionId: this._runSettings.caseHashDigest.toString("base64url"),
					fileCount: this.__modifiedFilePaths.length,
				});

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage("log", EXTENSION_LINK_END);
					return;
				}

				if (this._flowSettings.skipInstall) {
					return;
				}

				const rcFileString = await readFile(
					join(codemod.directoryPath, ".codemodrc.json"),
					{ encoding: "utf8" },
				);
				const rcFile = parseCodemodConfig(JSON.parse(rcFileString));
				if (rcFile.deps) {
					await handleInstallDependencies({
						printer: this._printer,
						affectedFiles: this.__modifiedFilePaths,
						target: this._flowSettings.target,
						deps: rcFile.deps,
					});
				}
			}
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			this._printer.printOperationMessage({
				kind: "error",
				message: `Error while running the codemod:\n${error.message}`,
			});
			this._telemetry.sendEvent({
				kind: "failedToExecuteCommand",
				commandName: "codemod.executeCodemod",
			});
		}
	}

	protected async _handleCommand(command: FormattedFileCommand): Promise<void> {
		await modifyFileSystemUponCommand(this._fs, this._runSettings, command);

		if (!this._runSettings.dryRun) {
			if (command.kind === "createFile") {
				this.__modifiedFilePaths.push(command.newPath);
			} else {
				this.__modifiedFilePaths.push(command.oldPath);
			}
		}

		const printerMessage = buildPrinterMessageUponCommand(
			this._runSettings,
			command,
		);

		if (printerMessage) {
			this._printer.printOperationMessage(printerMessage);
		}
	}
}
