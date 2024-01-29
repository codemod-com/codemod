import * as readline from 'node:readline';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { handleListNamesCommand } from './handleListCliCommand.js';
import { CodemodDownloader } from './downloadCodemod.js';
import { Printer } from './printer.js';
import { handleLearnCliCommand } from './handleLearnCliCommand.js';
import { join } from 'node:path';
import { homedir } from 'node:os';
import {
	buildOptions,
	buildUseCacheOption,
	buildUseJsonOption,
} from './buildOptions.js';
import { Runner } from './runner.js';
import * as fs from 'fs';
import { IFs } from 'memfs';
import { loadRepositoryConfiguration } from './repositoryConfiguration.js';
import { parseCodemodSettings } from './schemata/codemodSettingsSchema.js';
import { parseFlowSettings } from './schemata/flowSettingsSchema.js';
import { parseRunSettings } from './schemata/runArgvSettingsSchema.js';
import { buildArgumentRecord } from './buildArgumentRecord.js';
import { FileDownloadService } from './fileDownloadService.js';
import Axios from 'axios';
import { TarService } from './services/tarService.js';
import {
	AppInsightsTelemetryService,
	NoTelemetryService,
} from './telemetryService.js';
import { APP_INSIGHTS_INSTRUMENTATION_STRING } from './constants.js';
import { readFile } from 'node:fs/promises';
import { handleLoginCliCommand } from './handleLoginCliCommand.js';
import { handlePublishCliCommand } from './handlePublishCliCommand.js';
import { handleLogoutCliCommand } from './handleLogoutCliCommand.js';

// the build script contains the version
declare const __CODEMODCOM_CLI_VERSION__: string;

export const executeMainThread = async () => {
	const slicedArgv = hideBin(process.argv);

	const interfaze = readline.createInterface(process.stdin);

	const lineHandler = (line: string): void => {
		if (line === 'shutdown') {
			interfaze.off('line', lineHandler);

			process.exit(0);
		}
	};

	interfaze.on('line', lineHandler);

	process.stdin.unref();

	const argvObject = yargs(slicedArgv)
		.scriptName('codemod')
		.command('*', 'runs a codemod or recipe', (y) => buildOptions(y))
		.command(
			'runOnPreCommit [files...]',
			'run pre-commit codemods against staged files passed positionally',
			(y) => buildUseJsonOption(buildUseCacheOption(y)),
		)
		.command(
			'list',
			'lists all the codemods & recipes in the public registry',
			(y) => buildUseJsonOption(buildUseCacheOption(y)),
		)
		.command(
			'syncRegistry',
			'syncs all the codemods from the registry',
			(y) => buildUseJsonOption(y),
		)
		.command('sync [name]', 'synchronize a codemod', (y) =>
			buildUseJsonOption(
				y.positional('name', {
					type: 'string',
					description: 'The name of the codemod',
				}),
			),
		)
		.command(
			'learn',
			'exports the current `git diff` in a file to before/after panels in the Codemod Studio',
			(y) =>
				buildUseJsonOption(y).option('targetPath', {
					type: 'string',
					description: 'Input file path',
				}),
		)
		.command(
			'login',
			'logs in through authentication in the Codemod Studio',
			(y) =>
				buildUseJsonOption(y).option('token', {
					type: 'string',
					description: 'token required to sign in to the Codemod CLI',
				}),
		)
		.command('logout', 'logs out', (y) => buildUseJsonOption(y))
		.command('publish', 'publish the codemod to Codemod Registry', (y) =>
			buildUseJsonOption(y),
		)
		.help()
		.version(__CODEMODCOM_CLI_VERSION__);

	if (slicedArgv.length === 0) {
		argvObject.showHelp();
		return;
	}

	const argv = await Promise.resolve(argvObject.argv);

	const fetchBuffer = async (url: string) => {
		const { data } = await Axios.get(url, {
			responseType: 'arraybuffer',
		});

		return Buffer.from(data);
	};

	const printer = new Printer(argv.useJson);

	const fileDownloadService = new FileDownloadService(
		argv.useCache,
		fetchBuffer,
		() => Date.now(),
		fs as unknown as IFs,
		printer,
	);

	let telemetryService;
	let exit = () => {};

	if (!argv.telemetryDisable) {
		// hack to prevent appInsights from trying to read applicationinsights.json
		// this env should be set before appinsights is imported
		// https://github.com/microsoft/ApplicationInsights-node.js/blob/0217324c477a96b5dd659510bbccad27934084a3/Library/JsonConfig.ts#L122
		process.env['APPLICATIONINSIGHTS_CONFIGURATION_CONTENT'] = '{}';
		const appInsights = await import('applicationinsights');

		// .start() is skipped intentionally, to prevent any non-custom events from tracking
		appInsights.setup(APP_INSIGHTS_INSTRUMENTATION_STRING);

		telemetryService = new AppInsightsTelemetryService(
			appInsights.defaultClient,
		);

		exit = () => {
			appInsights.dispose();
			process.exit(0);
		};
	} else {
		telemetryService = new NoTelemetryService();
	}

	if (String(argv._) === 'list') {
		try {
			await handleListNamesCommand(printer);
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
		}

		exit();

		return;
	}

	const tarService = new TarService(fs as unknown as IFs);

	if (String(argv._) === 'syncRegistry') {
		const codemodDownloader = new CodemodDownloader(
			printer,
			join(homedir(), '.intuita'),
			argv.useCache,
			fileDownloadService,
			tarService,
		);

		try {
			await codemodDownloader.syncRegistry();
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
		}

		exit();

		return;
	}

	if (argv._.at(0) === 'sync' && argv.name !== undefined) {
		const codemodDownloader = new CodemodDownloader(
			printer,
			join(homedir(), '.intuita'),
			false,
			fileDownloadService,
			tarService,
		);

		try {
			await codemodDownloader.download(argv.name);
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
		}

		exit();

		return;
	}

	if (String(argv._) === 'learn') {
		const printer = new Printer(argv.useJson);
		const targetPath = argv.target ?? argv.targetPath ?? null;

		try {
			await handleLearnCliCommand(printer, targetPath);
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
		}

		exit();

		return;
	}

	if (String(argv._) === 'login') {
		const printer = new Printer(argv.useJson);
		const token = argv.token ?? null;

		try {
			await handleLoginCliCommand(printer, token);
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
		}

		exit();

		return;
	}

	if (String(argv._) === 'logout') {
		const printer = new Printer(argv.useJson);

		try {
			await handleLogoutCliCommand(printer);
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
		}

		exit();

		return;
	}

	if (String(argv._) === 'publish') {
		const printer = new Printer(argv.useJson);

		try {
			await handlePublishCliCommand(
				printer,
				argv.sourcePath ?? argv.source ?? process.cwd(),
			);
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: 'error',
				message: error.message,
			});
		}

		exit();

		return;
	}

	const configurationDirectoryPath = join(
		String(argv._) === 'runOnPreCommit' ? process.cwd() : homedir(),
		'.intuita',
	);

	const lastArgument = argv._[argv._.length - 1];
	const nameOrPath = typeof lastArgument === 'string' ? lastArgument : null;

	if (nameOrPath && fs.existsSync(nameOrPath)) {
		argv.source = nameOrPath;
	}

	const codemodSettings = parseCodemodSettings(argv);
	const flowSettings = parseFlowSettings(argv);
	const runSettings = parseRunSettings(homedir(), argv);
	const argumentRecord = buildArgumentRecord(argv);

	const codemodDownloader = new CodemodDownloader(
		printer,
		configurationDirectoryPath,
		argv.useCache,
		fileDownloadService,
		tarService,
	);

	const getCodemodSource = (path: string) =>
		readFile(path, { encoding: 'utf8' });

	const runner = new Runner(
		fs as unknown as IFs,
		printer,
		telemetryService,
		codemodDownloader,
		loadRepositoryConfiguration,
		codemodSettings,
		flowSettings,
		runSettings,
		argumentRecord,
		nameOrPath,
		process.cwd(),
		getCodemodSource,
	);

	await runner.run();

	exit();
};
