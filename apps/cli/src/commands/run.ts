import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { type PrinterBlueprint, chalk } from '@codemod-com/printer';
import {
	type CodemodToRun,
	Runner,
	parseCodemodSettings,
	parseFlowSettings,
	parseRunSettings,
} from '@codemod-com/runner';
import type { TelemetrySender } from '@codemod-com/telemetry';
import {
	TarService,
	doubleQuotify,
	parseCodemodConfig,
} from '@codemod-com/utilities';
import { AxiosError } from 'axios';
import terminalLink from 'terminal-link';
import type { TelemetryEvent } from '../analytics/telemetry.js';
import { buildSourcedCodemodOptions } from '../buildCodemodOptions.js';
import type { buildRunOptions } from '../buildOptions.js';
import { CodemodDownloader } from '../downloadCodemod.js';
import { buildPrinterMessageUponCommand } from '../fileCommands.js';
import { FileDownloadService } from '../fileDownloadService.js';
import { handleInstallDependencies } from '../handleInstallDependencies.js';
import { loadRepositoryConfiguration } from '../repositoryConfiguration.js';
import { buildSafeArgumentRecord } from '../safeArgumentRecord.js';
import { getConfigurationDirectoryPath } from '../utils.js';

export let handleRunCliCommand = async (
	printer: PrinterBlueprint,
	args: Awaited<ReturnType<ReturnType<typeof buildRunOptions>>['argv']>,
	telemetry: TelemetrySender<TelemetryEvent>,
) => {
	let nameOrPath = String(args._.at(-1));

	if (existsSync(nameOrPath)) {
		args.source = nameOrPath;
	}

	let codemodSettings = parseCodemodSettings(args);
	let flowSettings = parseFlowSettings(args);
	let runSettings = parseRunSettings(homedir(), args);

	let fileDownloadService = new FileDownloadService(
		args.noCache,
		fs,
		printer,
	);

	let tarService = new TarService(fs);

	let configurationDirectoryPath = getConfigurationDirectoryPath(args._);

	let codemodDownloader = new CodemodDownloader(
		printer,
		configurationDirectoryPath,
		args.noCache,
		fileDownloadService,
		tarService,
	);

	let codemods: CodemodToRun[] = [];

	if (codemodSettings.kind === 'runSourced') {
		let codemod = await buildSourcedCodemodOptions(
			fs,
			printer,
			codemodSettings,
			codemodDownloader,
		);

		codemods.push({
			...codemod,
			hashDigest: createHash('ripemd160')
				.update(codemodSettings.source)
				.digest(),
			safeArgumentRecord: buildSafeArgumentRecord(codemod, flowSettings),
		});
	} else if (codemodSettings.kind === 'runNamed') {
		let codemod: Awaited<ReturnType<typeof codemodDownloader.download>>;
		try {
			codemod = await codemodDownloader.download(nameOrPath);
		} catch (error) {
			if (error instanceof AxiosError) {
				if (
					error.response?.status === 400 &&
					error.response.data.error === 'Codemod not found'
				) {
					printer.printConsoleMessage(
						'error',
						chalk.white(
							'The specified command or codemod name could not be recognized.\n',
							'To view available commands, execute',
							`${chalk.bold(doubleQuotify('codemod --help'))}.\n`,
							'To see a list of existing codemods, run',
							`${chalk.bold(doubleQuotify('codemod search'))}`,
							'or',
							`${chalk.bold(doubleQuotify('codemod list'))}`,
							'with a query representing the codemod you are looking for.',
						),
					);

					process.exit(1);
				}
			}

			throw new Error(
				`Error while downloading codemod ${name}: ${error}`,
			);
		}

		codemods.push({
			...codemod,
			hashDigest: createHash('ripemd160').update(codemod.name).digest(),
			safeArgumentRecord: buildSafeArgumentRecord(codemod, flowSettings),
		});
	} else {
		let { preCommitCodemods } = await loadRepositoryConfiguration();

		for (let preCommitCodemod of preCommitCodemods) {
			if (preCommitCodemod.source === 'package') {
				let codemod = await codemodDownloader.download(
					preCommitCodemod.name,
				);
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

	let runner = new Runner(codemods, fs, runSettings, flowSettings);

	if (runSettings.dryRun) {
		printer.printConsoleMessage(
			'log',
			terminalLink(
				'Click to view the live results of this run in the Codemod VSCode Extension!',
				`vscode://codemod.codemod-vscode-extension/cases/${runSettings.caseHashDigest.toString(
					'base64url',
				)}`,
			),
		);
	}

	let depsToInstall: Record<
		string,
		{ deps: string[]; affectedFiles: string[] }
	> = {};

	await runner.run(
		async (codemod, filePaths) => {
			let codemodName = 'Standalone codemod (from user machine)';

			if (codemod.source === 'package') {
				if (codemodSettings.kind === 'runSourced') {
					codemodName = `${codemod.name} (from user machine)`;
				} else {
					codemodName = codemod.name;
				}

				let rcFileString = await readFile(
					join(codemod.directoryPath, '.codemodrc.json'),
					{ encoding: 'utf8' },
				);
				let rcFile = parseCodemodConfig(JSON.parse(rcFileString));

				if (rcFile.deps) {
					depsToInstall[codemodName] = {
						affectedFiles: filePaths,
						deps: rcFile.deps,
					};
				}
			}

			telemetry.sendEvent({
				kind: 'codemodExecuted',
				codemodName,
				executionId: runSettings.caseHashDigest.toString('base64url'),
				fileCount: filePaths.length,
			});
		},
		(error) => {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: `Error while running the codemod:\n${error.message}`,
			});
			telemetry.sendEvent({
				kind: 'failedToExecuteCommand',
				commandName: 'codemod.executeCodemod',
			});
		},
		(command) => {
			let printerMessage = buildPrinterMessageUponCommand(
				runSettings,
				command,
			);

			if (printerMessage) {
				printer.printOperationMessage(printerMessage);
			}
		},
		(message) => printer.printMessage(message),
	);

	if (runSettings.dryRun) {
		printer.printConsoleMessage(
			'log',
			terminalLink(
				'The run has finished! Click to open the Codemod VSCode Extension and view the results.',
				`vscode://codemod.codemod-vscode-extension/cases/${runSettings.caseHashDigest.toString(
					'base64url',
				)}`,
			),
		);
	}

	if (!runSettings.dryRun && !flowSettings.skipInstall) {
		for (let [codemodName, { deps, affectedFiles }] of Object.entries(
			depsToInstall,
		)) {
			await handleInstallDependencies({
				codemodName,
				printer,
				affectedFiles,
				target: flowSettings.target,
				deps,
			});
		}
	}
};
