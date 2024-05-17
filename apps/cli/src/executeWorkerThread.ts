import { parentPort } from "node:worker_threads";
import {
  type ConsoleKind,
  type MainThreadMessage,
  type WorkerThreadMessage,
  decodeMainThreadMessage,
} from "@codemod-com/printer";
import {
  type FileCommand,
  buildFormattedFileCommands,
  runAstGrepCodemod,
  runJscodeshiftCodemod,
  runTsMorphCodemod,
} from "@codemod-com/runner";

class PathAwareError extends Error {
  constructor(
    public readonly path: string,
    message?: string | undefined,
  ) {
    super(message);
  }
}

const consoleCallback = (consoleKind: ConsoleKind, message: string): void => {
  parentPort?.postMessage({
    kind: "console",
    consoleKind,
    message,
  } satisfies WorkerThreadMessage);
};

let initializationMessage:
  | (MainThreadMessage & { kind: "initialization" })
  | null = null;

const messageHandler = async (m: unknown) => {
  try {
    let message: MainThreadMessage;
    try {
      message = decodeMainThreadMessage(m);
    } catch (err) {
      throw new Error(`Failed to decode message: ${String(err)}`);
    }

    if (message.kind === "initialization") {
      initializationMessage = message;
      return;
    }

    if (message.kind === "exit") {
      parentPort?.off("message", messageHandler);
      return;
    }

    if (initializationMessage === null) {
      throw new Error();
    }

    try {
      let fileCommands: readonly FileCommand[] = [];
      switch (initializationMessage.codemodEngine) {
        case "jscodeshift":
          fileCommands = runJscodeshiftCodemod(
            initializationMessage.codemodSource,
            message.path,
            message.data,
            initializationMessage.disablePrettier,
            initializationMessage.safeArgumentRecord,
            initializationMessage.engineOptions,
            consoleCallback,
          );
          break;
        case "ts-morph":
          fileCommands = runTsMorphCodemod(
            initializationMessage.codemodSource,
            message.path,
            message.data,
            initializationMessage.disablePrettier,
            initializationMessage.safeArgumentRecord,
            consoleCallback,
          );
          break;
        case "ast-grep":
          fileCommands = await runAstGrepCodemod(
            initializationMessage.codemodPath,
            message.path,
            message.data,
            initializationMessage.disablePrettier,
          );
          break;
        case "workflow":
          throw new Error("Workflow engine is not supported in worker threads");
        default:
          throw new Error(
            `Unknown codemod engine: ${initializationMessage.codemodEngine}`,
          );
      }

      const commands = await buildFormattedFileCommands(fileCommands);

      parentPort?.postMessage({
        kind: "commands",
        commands,
        path: message.path,
      } satisfies WorkerThreadMessage);
    } catch (error) {
      throw new PathAwareError(
        message.path,
        error instanceof Error ? error.message : String(error),
      );
    }
  } catch (error) {
    parentPort?.postMessage({
      kind: "error",
      message: error instanceof Error ? error.message : String(error),
      path: error instanceof PathAwareError ? error.path : undefined,
    } satisfies WorkerThreadMessage);
  }
};

export const executeWorkerThread = () => {
  parentPort?.on("message", messageHandler);
};
