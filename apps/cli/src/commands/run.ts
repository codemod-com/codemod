import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { type PrinterBlueprint, boxen, chalk } from "@codemod-com/printer";
import {
  type CodemodToRun,
  Runner,
  buildPatterns,
  getTransformer,
  parseCodemodSettings,
  parseFlowSettings,
  parseRunSettings,
  transpile,
} from "@codemod-com/runner";
import type { TelemetrySender } from "@codemod-com/telemetry";
import {
  TarService,
  capitalize,
  doubleQuotify,
  execPromise,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import columnify from "columnify";
import inquirer from "inquirer";
import terminalLink from "terminal-link";
import type { TelemetryEvent } from "../analytics/telemetry.js";
import { buildSourcedCodemodOptions } from "../buildCodemodOptions.js";
import { buildCodemodEngineOptions } from "../buildEngineOptions.js";
import type { buildRunOptions } from "../buildOptions.js";
import { CodemodDownloader } from "../downloadCodemod.js";
import { buildPrinterMessageUponCommand } from "../fileCommands.js";
import { FileDownloadService } from "../fileDownloadService.js";
import { handleInstallDependencies } from "../handleInstallDependencies.js";
import { loadRepositoryConfiguration } from "../repositoryConfiguration.js";
import { buildSafeArgumentRecord } from "../safeArgumentRecord.js";
import { getConfigurationDirectoryPath } from "../utils.js";

const checkFileTreeVersioning = async (target: string) => {
  let force = true;

  try {
    const status = await execPromise("git status --porcelain", {
      cwd: target,
    });

    if (status.stdout.trim()) {
      const res = await inquirer.prompt<{ force: boolean }>({
        type: "confirm",
        name: "force",
        message:
          "Current git state contains uncommitted changes. Proceed anyway?",
        default: false,
      });

      force = res.force;
    }
  } catch (err) {
    if (!(err instanceof Error)) {
      return;
    }

    if (
      "stderr" in err &&
      typeof err.stderr === "string" &&
      err.stderr.trim().startsWith("fatal: not a git repository")
    ) {
      const res = await inquirer.prompt<{ force: boolean }>({
        type: "confirm",
        name: "force",
        message:
          "Target folder is not tracked by git. Codemod changes might be irreversible. Proceed anyway?",
        default: false,
      });

      force = res.force;

      return;
    }

    const res = await inquirer.prompt<{ force: boolean }>({
      type: "confirm",
      name: "force",
      message: "Could not run git working tree check. Proceed anyway?",
      default: false,
    });

    force = res.force;
  }

  if (!force) {
    process.exit(0);
  }
};

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
  const flowSettings = parseFlowSettings(args);
  const runSettings = parseRunSettings(homedir(), args);

  if (!runSettings.dryRun) {
    await checkFileTreeVersioning(flowSettings.target);
  }

  const fileDownloadService = new FileDownloadService(args.cache, fs, printer);

  const tarService = new TarService(fs);

  const configurationDirectoryPath = getConfigurationDirectoryPath(args._);

  const codemodDownloader = new CodemodDownloader(
    printer,
    configurationDirectoryPath,
    args.cache,
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

    const engineOptions = await buildCodemodEngineOptions(codemod.engine, args);

    codemods.push({
      ...codemod,
      hashDigest: createHash("ripemd160")
        .update(codemodSettings.source)
        .digest(),
      safeArgumentRecord: await buildSafeArgumentRecord(codemod, args, printer),
      engineOptions,
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
            chalk.red(
              "The specified command or codemod name could not be recognized.",
              "\nTo view available commands, execute",
              `${chalk.yellow.bold(doubleQuotify("codemod --help"))}.`,
              "\nTo see a list of existing codemods, run",
              `${chalk.yellow.bold(doubleQuotify("codemod search"))}`,
              "or",
              `${chalk.yellow.bold(doubleQuotify("codemod list"))}`,
              "with a query representing the codemod you are looking for.",
            ),
          );

          process.exit(1);
        }
      }

      throw new Error(`Error while downloading codemod ${name}: ${error}`);
    }

    const engineOptions = buildCodemodEngineOptions(codemod.engine, args);

    codemods.push({
      ...codemod,
      hashDigest: createHash("ripemd160").update(codemod.name).digest(),
      safeArgumentRecord: await buildSafeArgumentRecord(codemod, args, printer),
      engineOptions,
    });
  } else {
    const { preCommitCodemods } = await loadRepositoryConfiguration();

    for (const preCommitCodemod of preCommitCodemods) {
      if (preCommitCodemod.source === "package") {
        const codemod = await codemodDownloader.download(preCommitCodemod.name);
        const engineOptions = buildCodemodEngineOptions(codemod.engine, args);

        codemods.push({
          ...codemod,
          safeArgumentRecord: await buildSafeArgumentRecord(
            codemod,
            preCommitCodemod.arguments,
            printer,
          ),
          engineOptions,
        });
      }
    }
  }

  const runner = new Runner(codemods, fs, runSettings, flowSettings);

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

  if (codemods.length === 1) {
    // biome-ignore lint: assertion is correct
    const codemod = codemods[0]!;

    // biome-ignore lint: types don't matter here
    let transformer: any = null;

    if (codemod.engine === "filemod") {
      const codemodSource = await readFile(codemod.indexPath, {
        encoding: "utf8",
      });

      const transpiledSource = codemod.indexPath.endsWith(".ts")
        ? transpile(codemodSource.toString())
        : codemodSource.toString();

      transformer = getTransformer(transpiledSource);
    }

    const { include, exclude, reason } = await buildPatterns(
      flowSettings,
      codemod,
      transformer,
    );

    const patternsColumns = columnify(
      Array.from({
        length: Math.max(include.length, exclude.length),
      }).map(() => ({
        include: chalk.bold.green(include.shift() ?? ""),
        exclude: chalk.bold.red(exclude.shift() ?? ""),
      })),
      {
        headingTransform: (heading) => chalk.bold(capitalize(heading)),
        minWidth: 15,
      },
    );

    printer.printConsoleMessage(
      "info",
      boxen(
        chalk.cyan(
          "Running with the following configuration:",
          `\n\n${chalk.yellow.bold(reason ?? "")}\n${patternsColumns}\n`,
          chalk.yellow(
            !flowSettings.install ? "\nDependency installation disabled" : "",
          ),
          chalk.yellow(`\nRunning in ${flowSettings.threads} threads`),
          chalk.yellow(flowSettings.raw ? "\nFile formatting disabled" : ""),
        ),
        {
          padding: 2,
          dimBorder: true,
          textAlignment: "left",
          borderColor: "blue",
          borderStyle: "round",
        },
      ),
    );
  }

  const executionErrors = await runner.run(
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

      telemetry.sendDangerousEvent({
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
    (command) => {
      const printerMessage = buildPrinterMessageUponCommand(
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
      "log",
      terminalLink(
        "The run has finished! Click to open the Codemod VSCode Extension and view the results.",
        `vscode://codemod.codemod-vscode-extension/cases/${runSettings.caseHashDigest.toString(
          "base64url",
        )}`,
      ),
    );
  }

  if (executionErrors && executionErrors.length > 0) {
    const logsPath = join(
      configurationDirectoryPath,
      "logs",
      `${new Date().toISOString()}-error.log`,
    );

    try {
      await fs.promises.mkdir(join(configurationDirectoryPath, "logs"), {
        recursive: true,
      });
      await fs.promises.writeFile(
        logsPath,
        executionErrors
          .map(
            (e) =>
              `Error at ${e.filePath}${
                e.codemodName ? ` (${e.codemodName})` : ""
              }:\n${e.message}`,
          )
          .join("\n\n"),
      );
    } catch (err) {
      printer.printConsoleMessage(
        "error",
        `Failed to write error log file at ${logsPath}. Please verify that codemod CLI has the necessary permissions to write to this location.`,
      );
    }

    printer.printConsoleMessage(
      "error",
      chalk(
        "Certain files failed to be correctly processed by the codemod execution:",
        `\n${executionErrors
          .slice(0, 5)
          .map(
            (e) => `${e.filePath} ${e.codemodName ? `(${e.codemodName})` : ""}`,
          )
          .join("\n")
          .concat(
            executionErrors.length > 5
              ? `\n...and ${executionErrors.length - 5} more`
              : "",
          )}`,
        "\nPlease check the logs for more information at",
        chalk.bold(logsPath),
      ),
    );
  }

  if (!runSettings.dryRun && flowSettings.install) {
    for (const [codemodName, { deps, affectedFiles }] of Object.entries(
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
