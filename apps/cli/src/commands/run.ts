import { randomBytes } from "node:crypto";
import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { AxiosError } from "axios";
import inquirer from "inquirer";
import prettyjson from "prettyjson";

import { CODEMOD_NOT_FOUND } from "@codemod-com/api-types";
import {
  type PrinterBlueprint,
  chalk,
  colorLongString,
} from "@codemod-com/printer";
import { Runner, parseFlowSettings } from "@codemod-com/runner";
import type { TelemetrySender } from "@codemod-com/telemetry";
import {
  type Codemod,
  TarService,
  doubleQuotify,
  execPromise,
  parseCodemodConfig,
} from "@codemod-com/utilities";

import { version as cliVersion } from "#/../package.json";
import type { TelemetryEvent } from "#analytics/telemetry.js";
import type { GlobalArgvOptions, RunArgvOptions } from "#buildOptions.js";
import { getDiff, getDiffScreen } from "#dryrun-diff.js";
import { fetchCodemod } from "#fetch-codemod.js";
import { FileDownloadService } from "#fileDownloadService.js";
import { handleInstallDependencies } from "#handleInstallDependencies.js";
import type { NamedFileCommand } from "#types/commands.js";
import { writeLogs } from "#utils.js";

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

export const handleRunCliCommand = async (options: {
  printer: PrinterBlueprint;
  args: GlobalArgvOptions & RunArgvOptions;
  telemetry: TelemetrySender<TelemetryEvent>;
  onExit: () => void;
}) => {
  const { printer, args, telemetry, onExit } = options;

  // const runSettings = parseRunSettings(args);
  const flowSettings = parseFlowSettings(args, printer);

  if (
    !flowSettings.dry &&
    !args["disable-tree-version-check"] &&
    !args.readme &&
    !args.config &&
    !args.version
  ) {
    await checkFileTreeVersioning(flowSettings.target);
  }

  const fileDownloadService = new FileDownloadService(args.cache, fs, printer);

  const tarService = new TarService(fs);

  const nameOrPath = args._.at(0)?.toString() ?? args.source ?? null;
  if (nameOrPath === null) {
    throw new Error("Codemod to run was not specified!");
  }

  let codemod: Codemod;
  try {
    codemod = await fetchCodemod({
      nameOrPath,
      printer,
      argv: args,
      fileDownloadService,
      tarService,
    });
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

    throw new Error(`Error while downloading codemod ${nameOrPath}: ${error}`);
  }

  if (
    (args.readme || args.config || args.version) &&
    codemod.config.version.length === 0
  ) {
    return printer.printConsoleMessage(
      "error",
      chalk.red("Standalone codemods do not support this feature."),
    );
  }

  if (args.version) {
    return printer.printConsoleMessage(
      "log",
      chalk.cyan(`v${codemod.config.version}`),
    );
  }

  if (args.readme) {
    try {
      const readmeContents = await readFile(join(codemod.path, "README.md"), {
        encoding: "utf8",
      });

      return printer.printConsoleMessage(
        "log",
        colorLongString(readmeContents, chalk.cyan, 80),
      );
    } catch (err) {
      return printer.printConsoleMessage(
        "error",
        chalk.red("Could not find the manual file for the codemod."),
      );
    }
  }

  if (args.config) {
    try {
      const configContents = await readFile(
        join(codemod.path, ".codemodrc.json"),
        {
          encoding: "utf8",
        },
      );

      return printer.printConsoleMessage(
        "log",
        prettyjson.render(JSON.parse(configContents), {
          inlineArrays: true,
        }),
      );
    } catch (err) {
      return printer.printConsoleMessage(
        "error",
        chalk.red("Could not find the configuration file for the codemod."),
      );
    }
  }

  const runner = new Runner({ fs, flowSettings });

  const depsToInstall: Record<
    string,
    { deps: string[]; affectedFiles: string[] }
  > = {};

  const executionId = randomBytes(20).toString("base64url");
  const allExecutedCommands: NamedFileCommand[] = [];

  const executionErrors = await runner.run({
    codemod,
    format: args.format,
    onSuccess: async ({ codemod, commands }) => {
      const modifiedFilePaths = [
        ...new Set(
          commands.map((c) => ("oldPath" in c ? c.oldPath : c.newPath)),
        ),
      ];

      let codemodName = "Standalone codemod (from user machine)";

      if (codemod.type === "package") {
        if (codemod.source === "local") {
          codemodName = `${codemod.config.name} (from user machine)`;
        } else {
          codemodName = codemod.config.name;
        }

        const rcFileString = await readFile(
          join(codemod.path, ".codemodrc.json"),
          { encoding: "utf8" },
        );
        const rcFile = parseCodemodConfig(JSON.parse(rcFileString));

        if (codemodConfig.deps) {
          depsToInstall[codemodName] = {
            affectedFiles: modifiedFilePaths,
            deps: codemodConfig.deps,
          };
        }
      }

      allExecutedCommands.push(...commands.map((c) => ({ ...c, codemodName })));

      telemetry.sendDangerousEvent({
        kind: "codemodExecuted",
        codemodName,
        executionId,
        fileCount: modifiedFilePaths.length,
        cliVersion: cliVersion,
      });

      if (codemod.cleanup) {
        await fs.promises.rm(codemod.path, { recursive: true });
      }
    },
    onFailure: (error) => {
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
        cliVersion: cliVersion,
      });
    },
  });

  let printLogsNotice: (() => void) | null = null;

  if (args.logs && executionErrors?.length) {
    const notice = await writeLogs({
      prefix: "Codemod execution encountered errors.",
      content: executionErrors
        .map(
          (e) =>
            `Error at ${e.filePath}${
              e.codemodName ? ` (${e.codemodName})` : ""
            }:\n${e.message}`,
        )
        .join("\n\n"),
    });

    printLogsNotice = () => printer.printConsoleMessage("info", notice);
  }

  if (allExecutedCommands.length === 0) {
    return printer.printConsoleMessage(
      "info",
      chalk.yellow("No changes were made during the codemod run."),
    );
  }

  if (flowSettings.dry) {
    const screen = getDiffScreen(allExecutedCommands.map(getDiff));

    screen.key(["escape", "q", "C-c"], () => {
      screen?.destroy();
      printLogsNotice?.();
      return onExit();
    });

    return screen.render();
  }

  printLogsNotice?.();
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
};
