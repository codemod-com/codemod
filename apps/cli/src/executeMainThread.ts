import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import Axios from "axios";
import type { IFs } from "memfs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { version } from "../package.json";
import {
	buildOptions,
	buildUseCacheOption,
	buildUseJsonOption,
} from "./buildOptions.js";
import { APP_INSIGHTS_INSTRUMENTATION_STRING } from "./constants.js";
import { CodemodDownloader } from "./downloadCodemod.js";
import { FileDownloadService } from "./fileDownloadService.js";
import { handleInitCliCommand } from "./handleInitCliCommand";
import { handleLearnCliCommand } from "./handleLearnCliCommand.js";
import { handleListNamesCommand } from "./handleListCliCommand.js";
import { handleLoginCliCommand } from "./handleLoginCliCommand.js";
import { handleLogoutCliCommand } from "./handleLogoutCliCommand.js";
import { handlePublishCliCommand } from "./handlePublishCliCommand.js";
import { handleWhoAmICommand } from "./handleWhoAmICommand";
import { Printer } from "./printer.js";
import { loadRepositoryConfiguration } from "./repositoryConfiguration.js";
import { Runner } from "./runner.js";
import { parseCodemodSettings } from "./schemata/codemodSettingsSchema.js";
import { parseFlowSettings } from "./schemata/flowSettingsSchema.js";
import { parseRunSettings } from "./schemata/runArgvSettingsSchema.js";
import { TarService } from "./services/tarService.js";
import {
	AppInsightsTelemetryService,
	NoTelemetryService,
} from "./telemetryService.js";
import { execPromise, initGlobalNodeModules } from "./utils";

export const executeMainThread = async () => {
	const slicedArgv = hideBin(process.argv);

	const argvObject = yargs(slicedArgv)
		.scriptName("codemod")
		.usage("Usage: <command> [options]")
		.command("*", "runs a codemod or recipe", (y) => buildOptions(y))
		.command(
			"runOnPreCommit [files...]",
			"run pre-commit codemods against staged files passed positionally",
			(y) => buildUseJsonOption(buildUseCacheOption(y)),
		)
		.command(
			["list", "ls", "search"],
			"lists all the codemods & recipes in the public registry. can be used to search by name and tags",
			(y) => buildUseJsonOption(buildUseCacheOption(y)),
		)
		.command(
			"learn",
			"exports the current `git diff` in a file to before/after panels in the Codemod Studio",
			(y) => buildUseJsonOption(y),
		)
		.command(
			"login",
			"logs in through authentication in the Codemod Studio",
			(y) => buildUseJsonOption(y),
		)
		.command("logout", "logs out", (y) => buildUseJsonOption(y))
		.command(
			"whoami",
			"prints the user data of currently logged in user",
			(y) => buildUseJsonOption(y),
		)
		.command(
			"build",
			"build the JavaScript engine codemod (requires global esbuild installation)",
			(y) =>
				buildUseJsonOption(y).option("source", {
					type: "string",
					description: "path to the codemod to be built",
				}),
		)
		.command("publish", "publish the codemod to Codemod Registry", (y) =>
			buildUseJsonOption(y).option("source", {
				type: "string",
				description: "path to the codemod to be published",
			}),
		)
		.command(
			"unpublish",
			"unpublish previously published codemod from Codemod Registry",
			(y) =>
				buildUseJsonOption(y).option("force", {
					type: "boolean",
					alias: "f",
					description: "whether to remove all versions",
				}),
		)
		.command("init", "initialize a codemod package", (y) =>
			buildUseJsonOption(y).option("no-prompt", {
				alias: "y",
				type: "boolean",
				description: "skip all prompts and use default values",
			}),
		)
		.help()
		.version(version);

	if (slicedArgv.length === 0) {
		argvObject.showHelp();
		return;
	}

	const argv = await Promise.resolve(argvObject.argv);

	const fetchBuffer = async (url: string) => {
		const { data } = await Axios.get(url, {
			responseType: "arraybuffer",
		});

		return Buffer.from(data);
	};

	const printer = new Printer(argv.json);

	const fileDownloadService = new FileDownloadService(
		argv.noCache,
		fetchBuffer,
		() => Date.now(),
		fs as unknown as IFs,
		printer,
	);

	let telemetryService: AppInsightsTelemetryService | NoTelemetryService;
	let exit: () => void = () => {
		process.exit(0);
	};
	const tarService = new TarService(fs as unknown as IFs);

	if (!argv.telemetryDisable) {
		// hack to prevent appInsights from trying to read applicationinsights.json
		// this env should be set before appinsights is imported
		// https://github.com/microsoft/ApplicationInsights-node.js/blob/0217324c477a96b5dd659510bbccad27934084a3/Library/JsonConfig.ts#L122
		process.env.APPLICATIONINSIGHTS_CONFIGURATION_CONTENT = "{}";
		const appInsights = await import("applicationinsights");

		// .start() is skipped intentionally, to prevent any non-custom events from tracking
		appInsights.setup(APP_INSIGHTS_INSTRUMENTATION_STRING);

		telemetryService = new AppInsightsTelemetryService(
			appInsights.defaultClient,
		);

		exit = () => {
			// appInsights telemetry client uses batches to send telemetry.
			// this means that it waits for some timeout (default = 15000) to collect multiple telemetry events (envelopes) and then sends them in single batch
			// see Channel2.prototype.send
			// we need to flush all buffered events before exiting the process, otherwise all scheduled events will be lost
			appInsights.defaultClient.flush({
				callback: () => {
					appInsights.dispose();
					process.exit(0);
				},
			});
		};
	} else {
		telemetryService = new NoTelemetryService();
	}

	const executeCliCommand = async (
		executableCallback: () => Promise<unknown> | unknown,
	) => {
		try {
			await executableCallback();
		} catch (error) {
			if (!(error instanceof Error)) {
				return;
			}

			printer.printOperationMessage({
				kind: "error",
				message: error.message,
			});
		}

		exit();
	};

	process.on("SIGINT", exit);

	const configurationDirectoryPath = join(
		String(argv._) === "runOnPreCommit" ? process.cwd() : homedir(),
		".codemod",
	);

	const codemodDownloader = new CodemodDownloader(
		printer,
		configurationDirectoryPath,
		argv.noCache,
		fileDownloadService,
		tarService,
	);

	if (["list", "ls", "search"].includes(argv._.at(0) as string)) {
		const lastArgument =
			argv._.length > 1 ? String(argv._.at(-1)).trim() : null;

		let searchTerm: string | null = null;
		if (lastArgument) {
			if (lastArgument.length < 2) {
				throw new Error(
					"Search term must be at least 2 characters long. Aborting...",
				);
			}

			searchTerm = lastArgument;
		}

		return executeCliCommand(() => handleListNamesCommand(printer, searchTerm));
	}

	if (String(argv._) === "learn") {
		return executeCliCommand(() =>
			handleLearnCliCommand(printer, argv.target ?? null),
		);
	}

	if (String(argv._) === "whoami") {
		return executeCliCommand(() => handleWhoAmICommand(printer));
	}

	if (String(argv._) === "login") {
		return executeCliCommand(() => handleLoginCliCommand(printer));
	}

	if (String(argv._) === "logout") {
		return executeCliCommand(() => handleLogoutCliCommand(printer));
	}

	if (String(argv._) === "publish") {
		return executeCliCommand(() =>
			handlePublishCliCommand(printer, argv.source ?? process.cwd()),
		);
	}

	if (String(argv._) === "unpublish") {
		return executeCliCommand(() =>
			handlePublishCliCommand(printer, argv.source ?? process.cwd()),
		);
	}

	if (String(argv._) === "build") {
		await initGlobalNodeModules();

		try {
			await execPromise("esbuild --version");
		} catch (error) {
			printer.printOperationMessage({
				kind: "error",
				message:
					"To build packages using codemod CLI, esbuild has to be globally installed using your package manager. Please run `npm i -g esbuild`",
			});

			exit();
		}

		const { handleBuildCliCommand } = await import(
			"./handleBuildCliCommand.js"
		);

		return executeCliCommand(() =>
			handleBuildCliCommand(printer, argv.source ?? process.cwd()),
		);
	}

	if (String(argv._) === "init") {
		return executeCliCommand(() =>
			handleInitCliCommand(printer, argv.noPrompt),
		);
	}

	const lastArgument = argv._[argv._.length - 1];
	const nameOrPath = typeof lastArgument === "string" ? lastArgument : null;

	if (nameOrPath && fs.existsSync(nameOrPath)) {
		argv.source = nameOrPath;
	}

	const codemodSettings = parseCodemodSettings(argv);
	const flowSettings = parseFlowSettings(argv);
	const runSettings = parseRunSettings(homedir(), argv);

	const getCodemodSource = (path: string) =>
		readFile(path, { encoding: "utf8" });

	const runner = new Runner(
		fs as unknown as IFs,
		printer,
		telemetryService,
		codemodDownloader,
		loadRepositoryConfiguration,
		codemodSettings,
		flowSettings,
		runSettings,
		// TODO: fix type
		argv as Record<string, string | number | boolean>,
		nameOrPath,
		flowSettings.target,
		getCodemodSource,
	);

	await runner.run();

	exit();
};
