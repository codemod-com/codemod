import type { FileSystem } from "@codemod-com/utilities";
import type { CodemodToRun, RunResult } from "./codemod.js";
import {
  type FormattedFileCommand,
  modifyFileSystemUponCommand,
} from "./fileCommands.js";
import { runCodemod } from "./runCodemod.js";
import type {
  CodemodExecutionError,
  PrinterMessageCallback,
} from "./schemata/callbacks.js";
import type { FlowSettings } from "./schemata/flowSettingsSchema.js";
import type { RunSettings } from "./schemata/runArgvSettingsSchema.js";
import { SurfaceAgnosticCaseService } from "./services/surfaceAgnosticCaseService.js";

export class Runner {
  public constructor(
    protected readonly _codemods: CodemodToRun[],
    protected readonly _fs: FileSystem,
    protected readonly _runSettings: RunSettings,
    protected readonly _flowSettings: FlowSettings,
  ) {}

  public async run(
    onSuccess?: (runResult: RunResult) => Promise<void> | void,
    onFailure?: (error: Error) => Promise<void> | void,
    handleCommand?: (command: FormattedFileCommand) => Promise<void> | void,
    onPrinterMessage?: PrinterMessageCallback,
  ) {
    const executionErrors: CodemodExecutionError[] = [];

    for (const codemod of this._codemods) {
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
          onSuccess,
        );

        if (surfaceAgnosticCaseService) {
          await surfaceAgnosticCaseService.emitPostamble();
        }
      } catch (error) {
        if (!(error instanceof Error)) {
          return;
        }

        await onFailure?.(error);
      }
    }

    return executionErrors;
  }

  protected async _handleCommand(command: FormattedFileCommand): Promise<void> {
    await modifyFileSystemUponCommand(this._fs, this._runSettings, command);
  }
}
