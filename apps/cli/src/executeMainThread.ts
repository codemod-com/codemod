import { exec } from "child_process";
import * as fs from "fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "util";
import { codemodConfigSchema } from "@codemod-com/utilities";
import Axios from "axios";
import { IFs } from "memfs";
import { parse } from "valibot";
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
import { handleLearnCliCommand } from "./handleLearnCliCommand.js";
import { handleListNamesCommand } from "./handleListCliCommand.js";
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
			"list",
			"lists all the codemods & recipes in the public registry. can be used similar to search to filter by name",
			(y) => buildUseJsonOption(buildUseCacheOption(y)),
		)
		.command(
			"search",
			"searches codemods that resemble given string from user input using fuzzy search",
			(y) => buildUseJsonOption(y),
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

	if (argv._.at(0) === "list" || argv._.at(0) === "search") {
		try {
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

			await handleListNamesCommand({
				printer,
				search: searchTerm ?? undefined,
				short: argv.short,
			});
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

	if (String(argv._) === "learn") {
		const target = argv.target ?? null;

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
		// Allow node to look for modules in global paths
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

	// Install deps if not in CI and not dry run
	if (
		codemodSettings.kind !== "runOnPreCommit" &&
		runSettings.dryRun === false
	) {
		const { handleInstallDependencies } = await import(
			"./handleInstallDependencies.js"
		);

		try {
			if (codemodSettings.kind === "runSourced") {
				const rcFileString = await readFile(
					join(codemodSettings.source, ".codemodrc.json"),
					{ encoding: "utf8" },
				);
				const rcFile = parse(codemodConfigSchema, JSON.parse(rcFileString));
				if (rcFile.deps) {
					await handleInstallDependencies({
						printer,
						source: codemodSettings.source,
						deps: rcFile.deps,
					});
				}

				return;
			}

			const { directoryPath } = await codemodDownloader.download(
				codemodSettings.name,
			);
			const rcFile = parse(
				codemodConfigSchema,
				JSON.parse(join(directoryPath, ".codemodrc.json")),
			);
			if (rcFile.deps) {
				await handleInstallDependencies({
					printer,
					source: process.cwd(),
					deps: rcFile.deps,
				});
			}

			return;
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

	exit();
};
