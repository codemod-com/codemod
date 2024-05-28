import { readFile } from "node:fs/promises";
import { boxen, chalk } from "@codemod-com/printer";
import type {
  ArgumentRecord,
  EngineOptions,
  FileSystem,
} from "@codemod-com/utilities";
import type { Codemod } from "./codemod.js";
import {
  type FormattedFileCommand,
  modifyFileSystemUponCommand,
} from "./fileCommands.js";
import { getTransformer, transpile } from "./getTransformer.js";
import { buildPatterns, runCodemod } from "./runCodemod.js";
import type {
  CodemodExecutionError,
  PrinterMessageCallback,
} from "./schemata/callbacks.js";
import type { FlowSettings } from "./schemata/flowSettingsSchema.js";
import type { RunSettings } from "./schemata/runArgvSettingsSchema.js";
import { SurfaceAgnosticCaseService } from "./services/surfaceAgnosticCaseService.js";

export type CodemodToRun = Codemod & {
  codemodSource: "local" | "registry";
  safeArgumentRecord: ArgumentRecord;
  hashDigest?: Buffer;
  engineOptions: EngineOptions | null;
};

export class Runner {
  private __modifiedFilePaths: string[];

  public constructor(
    protected readonly _codemods: CodemodToRun[],
    protected readonly _fs: FileSystem,
    protected readonly _runSettings: RunSettings,
    protected readonly _flowSettings: FlowSettings,
  ) {
    this.__modifiedFilePaths = [];
  }

  public async run(
    onSuccess?: (
      codemod: CodemodToRun,
      filePaths: string[],
    ) => Promise<void> | void,
    onFailure?: (error: Error) => Promise<void> | void,
    handleCommand?: (command: FormattedFileCommand) => Promise<void> | void,
    onPrinterMessage?: PrinterMessageCallback,
  ) {
    const executionErrors: CodemodExecutionError[] = [];

    for (const codemod of this._codemods) {
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
        this._flowSettings,
        codemod,
        transformer,
      );

      let runningCodemodVersion = "";
      let runningCodemodName = "";

      if (codemod.source !== "standalone") {
        runningCodemodVersion += `@${codemod.version}`;
        runningCodemodName = codemod.name;
      } else {
        runningCodemodVersion += " (standalone)";
        runningCodemodName = codemod.indexPath;
      }

      onPrinterMessage?.({
        kind: "console",
        consoleKind: "info",
        message: boxen(
          chalk.cyan(
            `Codemod:`,
            chalk.bold(`${runningCodemodName}${runningCodemodVersion}`),
            codemod.codemodSource === "local"
              ? chalk.bold("\nRunning from local filesystem")
              : "",
            "\nTarget:",
            chalk.bold(this._flowSettings.target),
            "\n",
            chalk.yellow(reason ? `\n${reason}` : ""),
            chalk.green("\nIncluded patterns:"),
            chalk.green.bold(include.join(", ") ?? ""),
            chalk.red("\nExcluded patterns:"),
            chalk.red.bold(exclude.join(", ") ?? ""),
            "\n",
            chalk.yellow(
              !this._flowSettings.install
                ? "\nDependency installation disabled"
                : "",
            ),
            chalk.yellow(`\nRunning in ${this._flowSettings.threads} threads`),
            chalk.yellow(
              !this._flowSettings.format ? "\nFile formatting disabled" : "",
            ),
          ),
          {
            padding: 2,
            dimBorder: true,
            textAlignment: "left",
            borderColor: "blue",
            borderStyle: "round",
          },
        ),
      });

      try {
        let surfaceAgnosticCaseService: SurfaceAgnosticCaseService | null =
          null;
        if (codemod.hashDigest) {
          surfaceAgnosticCaseService = new SurfaceAgnosticCaseService(
            this._fs,
            this._runSettings,
            this._flowSettings,
            codemod.safeArgumentRecord,
            codemod.hashDigest,
          );

          await surfaceAgnosticCaseService.emitPreamble();
        }

        await runCodemod(
          this._fs,
          codemod,
          this._flowSettings,
          this._runSettings,
          async (command) => {
            // we want to track modified files for recipes
            if (codemod.engine === "recipe") {
              await this._updateModifiedPaths(command);
              return;
            }

            await this._handleCommand(command);

            if (handleCommand) {
              await handleCommand(command);
            }

            if (surfaceAgnosticCaseService) {
              await surfaceAgnosticCaseService.emitJob(command);
            }
          },
          onPrinterMessage ?? (() => {}),
          codemod.safeArgumentRecord,
          codemod.engineOptions,
          (error) => executionErrors.push(error),
        );

        if (surfaceAgnosticCaseService) {
          await surfaceAgnosticCaseService.emitPostamble();
        }

        await onSuccess?.(codemod, this.__modifiedFilePaths);
      } catch (error) {
        if (!(error instanceof Error)) {
          return;
        }

        await onFailure?.(error);
      }
    }

    return executionErrors;
  }

  protected async _updateModifiedPaths(
    command: FormattedFileCommand,
  ): Promise<void> {
    if (this._runSettings.dryRun) {
      return;
    }

    const modifiedAtPath =
      "oldPath" in command ? command.oldPath : command.newPath;

    this.__modifiedFilePaths.push(modifiedAtPath);
  }

  protected async _handleCommand(command: FormattedFileCommand): Promise<void> {
    await modifyFileSystemUponCommand(this._fs, this._runSettings, command);
    await this._updateModifiedPaths(command);
  }
}
