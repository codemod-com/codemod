import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import * as os from "node:os";
import { homedir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { CODEMOD_NOT_FOUND } from "@codemod-com/api-types";
import {
  type PrinterBlueprint,
  boxen,
  chalk,
  colorLongString,
} from "@codemod-com/printer";
import {
  type Codemod,
  type CodemodSettings,
  type CodemodToRun,
  type FormattedFileCommand,
  Runner,
  parseCodemodSettings,
  parseFlowSettings,
  parseRunSettings,
} from "@codemod-com/runner";
import type { TelemetrySender } from "@codemod-com/telemetry";
import {
  TarService,
  doubleQuotify,
  execPromise,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { AxiosError } from "axios";
import blessed from "blessed";
import * as diff from "diff";
import inquirer from "inquirer";
import prettyjson from "prettyjson";
import { version } from "../../package.json";
import type { TelemetryEvent } from "../analytics/telemetry.js";
import { buildSourcedCodemodOptions } from "../buildCodemodOptions.js";
import { buildCodemodEngineOptions } from "../buildEngineOptions.js";
import type { GlobalArgvOptions, RunArgvOptions } from "../buildOptions.js";
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
    } else {
      const res = await inquirer.prompt<{ force: boolean }>({
        type: "confirm",
        name: "force",
        message:
          "Could not run git working tree check. Codemod changes might be irreversible. Proceed anyway?",
        default: false,
      });

      force = res.force;
    }
  }

  if (!force) {
    process.exit(0);
  }
};

export const transformCodemodToRunnable = async (options: {
  codemod: Codemod;
  codemodArguments: Record<string, unknown>;
  printer: PrinterBlueprint;
  argv: GlobalArgvOptions & RunArgvOptions;
}): Promise<CodemodToRun> => {
  const getCodemodName = (cdmd: Codemod) => {
    if ("name" in cdmd) {
      return cdmd.name;
    }

    return null;
  };
  const { codemod, codemodArguments, printer, argv } = options;

  const safeArgumentRecord = await buildSafeArgumentRecord(
    codemod,
    codemodArguments,
    printer,
  );

  const engineOptions = buildCodemodEngineOptions(codemod.engine, argv);

  if (codemod.engine === "recipe") {
    return {
      ...codemod,
      codemods: await Promise.all(
        codemod.codemods.map(async (subCodemod) =>
          transformCodemodToRunnable({ ...options, codemod: subCodemod }),
        ),
      ),
      safeArgumentRecord,
      engineOptions,
    };
  }

  const codemodToRun: CodemodToRun = {
    ...codemod,
    safeArgumentRecord,
    engineOptions,
  };

  const codemodName = getCodemodName(codemod);
  if (codemodName) {
    codemodToRun.hashDigest = createHash("ripemd160")
      .update(codemodName)
      .digest();
  }

  return codemodToRun;
};

const printCodemodVersion = (codemod: Codemod, printer: PrinterBlueprint) => {
  if (codemod.bundleType === "standalone") {
    return printer.printConsoleMessage(
      "log",
      chalk.cyan("Standalone codemods do not support versioning."),
    );
  }

  return printer.printConsoleMessage("log", chalk.cyan(`v${codemod.version}`));
};

export const handleRunCliCommand = async (options: {
  printer: PrinterBlueprint;
  args: GlobalArgvOptions & RunArgvOptions;
  telemetry: TelemetrySender<TelemetryEvent>;
  onExit: () => void;
}) => {
  const { printer, args, telemetry, onExit } = options;

  const codemodSettings = parseCodemodSettings(args);
  const flowSettings = parseFlowSettings(args, printer);
  const runSettings = parseRunSettings(homedir(), args);

  if (
    !runSettings.dryRun &&
    !args["disable-tree-version-check"] &&
    !args.readme &&
    !args.config &&
    !args.version
  ) {
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

  let codemodDefinition:
    | {
        kind: Exclude<CodemodSettings["kind"], "runOnPreCommit">;
        codemod: CodemodToRun;
      }
    | { kind: "runOnPreCommit"; codemods: CodemodToRun[] }
    | null = null;

  if (codemodSettings.kind === "runSourced") {
    const codemod = await buildSourcedCodemodOptions(
      fs,
      printer,
      codemodSettings,
      codemodDownloader,
      tarService,
    );

    if (args.version) {
      return printCodemodVersion(codemod, printer);
    }

    codemodDefinition = {
      kind: codemodSettings.kind,
      codemod: {
        ...(await transformCodemodToRunnable({
          codemod,
          argv: args,
          codemodArguments: args,
          printer,
        })),
        cleanup: extname(codemodSettings.source) === ".zip",
        source: "local",
      },
    };
  } else if (codemodSettings.kind === "runNamed") {
    let codemod: Awaited<ReturnType<typeof codemodDownloader.download>>;
    try {
      codemod = await codemodDownloader.download(
        codemodSettings.name,
        args.readme || args.config || args.version,
      );

      if (args.version) {
        return printCodemodVersion(codemod, printer);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (
          error.response?.status === 400 &&
          error.response.data.error === CODEMOD_NOT_FOUND
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

      throw new Error(
        `Error while downloading codemod ${codemodSettings.name}: ${error}`,
      );
    }

    codemodDefinition = {
      kind: codemodSettings.kind,
      codemod: {
        ...(await transformCodemodToRunnable({
          codemod,
          argv: args,
          codemodArguments: args,
          printer,
        })),
      },
    };
  } else {
    const { preCommitCodemods } = await loadRepositoryConfiguration();

    const codemods: CodemodToRun[] = [];
    for (const preCommitCodemod of preCommitCodemods) {
      if (preCommitCodemod.source === "package") {
        const codemod = await codemodDownloader.download(preCommitCodemod.name);

        codemods.push(
          await transformCodemodToRunnable({
            codemod,
            argv: args,
            codemodArguments: preCommitCodemod.arguments,
            printer,
          }),
        );
      }

      codemodDefinition = {
        kind: codemodSettings.kind,
        codemods,
      };
    }
  }

  if (!codemodDefinition) {
    throw new Error("Codemod definition could not be resolved.");
  }

  if (codemodDefinition.kind !== "runOnPreCommit") {
    if (args.readme || args.config) {
      if (codemodDefinition.codemod.bundleType === "standalone") {
        printer.printConsoleMessage(
          "error",
          chalk.red("Standalone codemods do not support this feature."),
        );
        return;
      }

      if (args.readme) {
        let readmeContents: string;

        try {
          readmeContents = await readFile(
            join(codemodDefinition.codemod.directoryPath, "description.md"),
            { encoding: "utf8" },
          );

          printer.printConsoleMessage(
            "log",
            colorLongString(readmeContents, chalk.cyan, 80),
          );
        } catch (err) {
          printer.printConsoleMessage(
            "error",
            chalk.red("Could not find the manual file for the codemod."),
          );
        }
      }

      if (args.config) {
        let configContents: string;

        try {
          configContents = await readFile(
            join(codemodDefinition.codemod.directoryPath, ".codemodrc.json"),
            { encoding: "utf8" },
          );

          printer.printConsoleMessage(
            "log",
            prettyjson.render(JSON.parse(configContents), {
              inlineArrays: true,
            }),
          );
        } catch (err) {
          printer.printConsoleMessage(
            "error",
            chalk.red("Could not find the configuration file for the codemod."),
          );
        }
      }

      return;
    }
  }

  const codemodsToRun =
    codemodDefinition.kind === "runOnPreCommit"
      ? codemodDefinition.codemods
      : [codemodDefinition.codemod];
  const runner = new Runner(codemodsToRun, fs, runSettings, flowSettings);

  const depsToInstall: Record<
    string,
    { deps: string[]; affectedFiles: string[] }
  > = {};

  type CommandWithCodemodName = FormattedFileCommand & { codemodName: string };
  const allExecutedCommands: CommandWithCodemodName[] = [];

  const executionErrors = await runner.run(
    async ({ codemod, commands, recipe }) => {
      const modifiedFilePaths = [
        ...new Set(
          commands.map((c) => ("oldPath" in c ? c.oldPath : c.newPath)),
        ),
      ];

      let codemodName = "Standalone codemod (from user machine)";

      if (codemod.bundleType === "package") {
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
            affectedFiles: modifiedFilePaths,
            deps: rcFile.deps,
          };
        }
      }

      allExecutedCommands.push(...commands.map((c) => ({ ...c, codemodName })));

      telemetry.sendDangerousEvent({
        kind: "codemodExecuted",
        codemodName,
        // Codemod executed from the recipe will share the same  executionId
        executionId: runSettings.caseHashDigest.toString("base64url"),
        fileCount: modifiedFilePaths.length,
        ...(recipe && { recipeName: recipe.name }),
      });

      if (codemod.cleanup) {
        await fs.promises.rm(dirname(codemod.source), { recursive: true });
      }
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

  let screen: blessed.Widgets.Screen | null = null;
  if (runSettings.dryRun && allExecutedCommands.length > 0) {
    interface DiffResult {
      filename: string;
      codemodName: string;
      diff: string;
    }

    function getDiff(command: CommandWithCodemodName): DiffResult {
      if (command.kind === "createFile") {
        return {
          filename: command.newPath,
          codemodName: command.codemodName,
          diff: chalk.bgGreen(command.newData),
        };
      }

      if (command.kind === "deleteFile") {
        return {
          filename: command.oldPath,
          codemodName: command.codemodName,
          diff: "",
        };
      }

      if (command.kind === "moveFile") {
        return {
          filename: `${command.oldPath} -> ${command.newPath}`,
          codemodName: command.codemodName,
          diff: "",
        };
      }

      if (command.kind === "copyFile") {
        return {
          filename: `COPIED: ${command.oldPath} -> ${command.newPath}`,
          codemodName: command.codemodName,
          diff: "",
        };
      }

      const diffResult = diff.diffWords(command.oldData, command.newData);

      const formattedDiff = diffResult
        .map((part) => {
          const color = part.added ? "green" : part.removed ? "red" : "grey";

          return chalk[color](part.value);
          // return part.value
          //   .split("\n")
          //   .map((line) => chalk[color](line))
          //   .join("\n");
        })
        .join("");

      return {
        filename: `${command.oldPath}`,
        codemodName: command.codemodName,
        diff: formattedDiff,
      };
    }

    const diffs = allExecutedCommands.map(getDiff);

    screen = blessed.screen({
      smartCSR: true,
      title: "Diff Viewer",
    });

    const diffContent = diffs
      .map(
        (diff) =>
          `${boxen(`@@ ${basename(diff.filename)} (${diff.codemodName})`, { padding: 0.5 })}\n${diff.diff}`,
      )
      .join("\n\n");

    const diffBox = blessed.box({
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      content: diffContent,
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
      mouse: true,
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "#f0f0f0",
        },
      },
    });

    screen.append(diffBox);

    diffBox.focus();
  }

  const logsPath = join(
    configurationDirectoryPath,
    "logs",
    `${new Date().toISOString()}-error.log`,
  );

  let logsContent = `- CLI version: ${version}
  - Node version: ${process.versions.node}
  - OS: ${os.type()} ${os.release()} ${os.arch()}

  `;

  if (executionErrors && executionErrors.length > 0) {
    logsContent += executionErrors
      .map(
        (e) =>
          `Error at ${e.filePath}${
            e.codemodName ? ` (${e.codemodName})` : ""
          }:\n${e.message}`,
      )
      .join("\n\n");
  }

  try {
    await fs.promises.mkdir(join(configurationDirectoryPath, "logs"), {
      recursive: true,
    });
    await fs.promises.writeFile(logsPath, logsContent);
  } catch (err) {
    printer.printConsoleMessage(
      "error",
      `Failed to write error log file at ${logsPath}. Please verify that codemod CLI has the necessary permissions to write to this location.`,
    );
  }

  const printLogsNotice = () =>
    printer.printConsoleMessage(
      "info",
      chalk.cyan(
        "\nLogs can be found at:",
        chalk.bold(logsPath),
        "\nFor feedback or reporting issues, run",
        chalk.bold(doubleQuotify("codemod feedback")),
        "and include the logs.",
      ),
    );

  if (runSettings.dryRun && screen) {
    screen.key(["escape", "q", "C-c"], () => {
      screen?.destroy();
      printLogsNotice();
      return onExit();
    });

    screen.render();
  } else {
    printLogsNotice();

    if (flowSettings.install) {
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
  }
};
