import { exec, execSync } from "child_process";
import * as fs from "fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import * as readline from "node:readline";
import { promisify } from "util";
import Axios from "axios";
import { IFs } from "memfs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { buildArgumentRecord } from "./buildArgumentRecord.js";
import {
	buildOptions,
	buildUseCacheOption,
	buildUseJsonOption,
} from "./buildOptions.js";
import { APP_INSIGHTS_INSTRUMENTATION_STRING } from "./constants.js";
import { CodemodDownloader } from "./downloadCodemod.js";
import { FileDownloadService } from "./fileDownloadService.js";
import { handleLearnCliCommand } from "./handleLearnCliCommand.js";
import { handleListNamesAfterSyncing } from "./handleListCliCommand.js";
import { handleLoginCliCommand } from "./handleLoginCliCommand.js";
import { handleLogoutCliCommand } from "./handleLogoutCliCommand.js";
import { handlePublishCliCommand } from "./handlePublishCliCommand.js";
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

// the build script contains the version
declare const __CODEMODCOM_CLI_VERSION__: string;

const WAIT_INPUT_TIMEOUT = 300;

export const executeMainThread = async () => {
	const slicedArgv = hideBin(process.argv);

	const interfaze = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const lineHandler = (line: string): void => {
		if (line === "shutdown") {
			interfaze.off("line", lineHandler);
			interfaze.close();
			process.exit(0);
		}

		userInput += `${line}\n`;
	};

	interfaze.on("line", lineHandler);

	let userInput = "";

	if (!process.stdin.isTTY) {
		await new Promise((resolve) => {
			setTimeout(() => {
				if (userInput.trim() === "") {
					// skip if no input in 1000 ms
					resolve(null);
				}
			}, WAIT_INPUT_TIMEOUT);

			interfaze.on("close", () => {
				resolve(null);
			});
		});
	}

	process.stdin.unref();

	const argvObject = yargs(slicedArgv)
		.usage("Usage: <command> [options]")
		.command("*", "runs a codemod or recipe", (y) => buildOptions(y))
		.command(
			"runOnPreCommit [files...]",
			"run pre-commit codemods against staged files passed positionally",
			(y) => buildUseJsonOption(buildUseCacheOption(y)),
		)
		.command(
			"list",
			"lists all the codemods & recipes in the public registry",
			(y) => buildUseJsonOption(buildUseCacheOption(y)),
		)
		.command("sync", "syncs all the codemods from the registry", (y) =>
			buildUseJsonOption(y),
		)
		.command(
			"learn",
			"exports the current `git diff` in a file to before/after panels in the Codemod Studio",
			(y) =>
				buildUseJsonOption(y).option("target", {
					type: "string",
					description: "Input file path",
				}),
		)
		.command(
			"login",
			"logs in through authentication in the Codemod Studio",
			(y) =>
				buildUseJsonOption(y).option("token", {
					type: "string",
					description: "token required to sign in to the Codemod CLI",
				}),
		)
		.command("logout", "logs out", (y) => buildUseJsonOption(y))
		.command("publish", "publish the codemod to Codemod Registry", (y) =>
			buildUseJsonOption(y),
		)
		.help()
		.version(__CODEMODCOM_CLI_VERSION__);

	if (slicedArgv.length === 0) {
		argvObject.showHelp();
		return;
	}

	const argv = {
		...(await Promise.resolve(argvObject.argv)),
		"arg:input": userInput,
	};

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
	let exit = () => {};
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

	if (String(argv._) === "list") {
		try {
			await handleListNamesAfterSyncing(
				argv.noCache,
				argv.short,
				printer,
				fileDownloadService,
				tarService,
			);
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

		return;
	}

	if (String(argv._) === "sync") {
		await syncRegistryOperation(
			argv.noCache,
			printer,
			fileDownloadService,
			tarService,
		);
		exit();

		return;
	}

	if (String(argv._) === "learn") {
		const printer = new Printer(argv.json);
		const target = argv.target ?? argv.target ?? null;

		try {
			await handleLearnCliCommand(printer, target);
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

		return;
	}

	if (String(argv._) === "login") {
		const printer = new Printer(argv.json);
		const token = argv.token ?? null;

		try {
			await handleLoginCliCommand(printer, token);
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

		return;
	}

	if (String(argv._) === "logout") {
		const printer = new Printer(argv.json);

		try {
			await handleLogoutCliCommand(printer);
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

		return;
	}

	if (String(argv._) === "publish") {
		const printer = new Printer(argv.json);

		try {
			await handlePublishCliCommand(printer, argv.source ?? process.cwd());
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

		return;
	}

	if (String(argv._) === "build") {
		const printer = new Printer(argv.json);

		// Allow node to look for modules in global paths (currently used for `codemod build`)
		const execPromise = promisify(exec);
		const globalPaths = await Promise.allSettled([
			execPromise("npm root -g"),
			execPromise("pnpm root -g"),
			execPromise("yarn global dir"),
			execPromise("echo $BUN_INSTALL/install/global/node_modules"),
		]);
		process.env.NODE_PATH = globalPaths
			.map((res) =>
				res.status === "fulfilled" ? res.value.stdout.trim() : null,
			)
			.filter(Boolean)
			.join(":");
		require("module").Module._initPaths();

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

		try {
			await handleBuildCliCommand(printer, argv.source ?? process.cwd());
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

		return;
	}

	const configurationDirectoryPath = join(
		String(argv._) === "runOnPreCommit" ? process.cwd() : homedir(),
		".codemod",
	);

	const lastArgument = argv._[argv._.length - 1];
	const nameOrPath = typeof lastArgument === "string" ? lastArgument : null;

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
		argv.noCache,
		fileDownloadService,
		tarService,
	);

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
		argumentRecord,
		nameOrPath,
		process.cwd(),
		getCodemodSource,
	);

	await runner.run();

	exit();
};

export async function syncRegistryOperation(
	disableCache: boolean,
	printer: Printer,
	fileDownloadService: FileDownloadService,
	tarService: TarService,
) {
	const codemodDownloader = new CodemodDownloader(
		printer,
		join(homedir(), ".codemod"),
		disableCache,
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
			kind: "error",
			message: error.message,
		});
	}
}
