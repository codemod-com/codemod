import { createHash } from 'crypto';
import terminalLink from 'terminal-link';

import type { ArgumentRecord } from './schemata/argumentRecordSchema.js';
import {
	modifyFileSystemUponCommand,
	type FormattedFileCommand,
	buildPrinterMessageUponCommand,
} from './fileCommands.js';
import type { PrinterBlueprint } from './printer.js';
import { runCodemod } from './runCodemod.js';

import { buildSafeArgumentRecord } from './safeArgumentRecord.js';
import type { IFs } from 'memfs';
import type { CodemodDownloaderBlueprint } from './downloadCodemod.js';
import type { RepositoryConfiguration } from './repositoryConfiguration.js';
import type { CodemodSettings } from './schemata/codemodSettingsSchema.js';
import type { FlowSettings } from './schemata/flowSettingsSchema.js';
import type { TelemetryBlueprint } from './telemetryService.js';
import { buildSourcedCodemodOptions } from './buildCodemodOptions.js';
import { SurfaceAgnosticCaseService } from './services/surfaceAgnosticCaseService.js';
import { RunSettings } from './schemata/runArgvSettingsSchema.js';

export class Runner {
	private __modifiedFileCount: number;

	public constructor(
		protected readonly _fs: IFs,
		protected readonly _printer: PrinterBlueprint,
		protected readonly _telemetry: TelemetryBlueprint,
		protected readonly _codemodDownloader: CodemodDownloaderBlueprint,
		protected readonly _loadRepositoryConfiguration: () => Promise<RepositoryConfiguration>,
		protected readonly _codemodSettings: CodemodSettings,
		protected readonly _flowSettings: FlowSettings,
		protected readonly _runSettings: RunSettings,
		protected readonly _argumentRecord: ArgumentRecord,
		protected readonly _name: string | null,
		protected readonly _currentWorkingDirectory: string,
		protected readonly _getCodemodSource: (path: string) => Promise<string>,
	) {
		this.__modifiedFileCount = 0;
	}

	public async run() {
		const EXTENSION_LINK_START = terminalLink(
			'Click to view the live results of this run in the Intuita VSCode Extension!',
			`vscode://intuita.intuita-vscode-extension/cases/${this._runSettings.caseHashDigest.toString(
				'base64url',
			)}`,
		);

		const EXTENSION_LINK_END = terminalLink(
			'The run has finished! Click to open the Intuita VSCode Extension and view the results.',
			`vscode://intuita.intuita-vscode-extension/cases/${this._runSettings.caseHashDigest.toString(
				'base64url',
			)}`,
		);

		try {
			if (this._codemodSettings.kind === 'runSourced') {
				const codemodOptions = await buildSourcedCodemodOptions(
					this._fs,
					this._codemodSettings,
				);

				const safeArgumentRecord = buildSafeArgumentRecord(
					codemodOptions,
					this._argumentRecord,
				);

				const codemodHashDigest = createHash('ripemd160')
					.update(this._codemodSettings.sourcePath)
					.digest();

				const surfaceAgnosticCaseService =
					new SurfaceAgnosticCaseService(
						this._fs,
						this._runSettings,
						this._flowSettings,
						this._argumentRecord,
						codemodHashDigest,
					);

				await surfaceAgnosticCaseService.emitPreamble();

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage(
						'log',
						EXTENSION_LINK_START,
					);
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
					kind: 'codemodExecuted',
					codemodName: 'Codemod from FS',
					executionId:
						this._runSettings.caseHashDigest.toString('base64url'),
					fileCount: this.__modifiedFileCount,
				});

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage(
						'log',
						EXTENSION_LINK_END,
					);
				}

				return;
			}

			if (this._codemodSettings.kind === 'runOnPreCommit') {
				const { preCommitCodemods } =
					await this._loadRepositoryConfiguration();

				for (const preCommitCodemod of preCommitCodemods) {
					if (preCommitCodemod.source === 'registry') {
						const codemod = await this._codemodDownloader.download(
							preCommitCodemod.name,
							this._flowSettings.useCache,
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
							kind: 'codemodExecuted',
							codemodName: codemod.name,
							executionId:
								this._runSettings.caseHashDigest.toString(
									'base64url',
								),
							fileCount: this.__modifiedFileCount,
						});
					}
				}

				return;
			}

			if (this._name !== null) {
				this._printer.printConsoleMessage(
					'info',
					`Executing the "${this._name}" codemod against "${this._flowSettings.targetPath}"`,
				);

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage(
						'log',
						EXTENSION_LINK_START,
					);
				}

				const codemod = await this._codemodDownloader.download(
					this._name,
					this._flowSettings.useCache,
				);

				const codemodHashDigest = createHash('ripemd160')
					.update(codemod.name)
					.digest();

				const safeArgumentRecord = buildSafeArgumentRecord(
					codemod,
					this._argumentRecord,
				);

				const surfaceAgnosticCaseService =
					new SurfaceAgnosticCaseService(
						this._fs,
						this._runSettings,
						this._flowSettings,
						this._argumentRecord,
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
					kind: 'codemodExecuted',
					codemodName: codemod.name,
					executionId:
						this._runSettings.caseHashDigest.toString('base64url'),
					fileCount: this.__modifiedFileCount,
				});

				if (this._runSettings.dryRun) {
					this._printer.printConsoleMessage(
						'log',
						EXTENSION_LINK_END,
					);
				}
			}
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			this._printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
			this._telemetry.sendEvent({
				kind: 'failedToExecuteCommand',
				commandName: 'intuita.executeCodemod',
			});
		}
	}

	protected async _handleCommand(
		command: FormattedFileCommand,
	): Promise<void> {
		await modifyFileSystemUponCommand(this._fs, this._runSettings, command);

		if (!this._runSettings.dryRun) {
			++this.__modifiedFileCount;
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
