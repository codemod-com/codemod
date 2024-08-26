import { parentPort } from "node:worker_threads";

import {
  type MainThreadMessage,
  type WorkerThreadMessage,
  decodeMainThreadMessage,
} from "@codemod-com/printer";
import {
  getTransformer,
  runAstGrepCodemod,
  runJscodeshiftCodemod,
  runTsMorphCodemod,
} from "@codemod-com/runner";
import type { FileCommand } from "@codemod-com/utilities";

class PathAwareError extends Error {
  constructor(
    public readonly path: string,
    message?: string | undefined,
  ) {
    super(message);
  }
}

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
      let commands: readonly FileCommand[] = [];
      switch (initializationMessage.engine) {
        case "jscodeshift": {
          const transformer = await getTransformer(
            initializationMessage.codemodSource,
          );

          if (typeof transformer !== "function") {
            throw new Error("Invalid transformer");
          }

          commands = runJscodeshiftCodemod(
            transformer,
            message.path,
            message.data,
            initializationMessage.safeArgumentRecord,
            initializationMessage.engineOptions,
          );
          break;
        }
        case "ts-morph": {
          const transformer = await getTransformer(
            initializationMessage.codemodSource,
          );

          if (typeof transformer !== "function") {
            throw new Error("Invalid transformer");
          }

          commands = runTsMorphCodemod(
            transformer,
            message.path,
            message.data,
            initializationMessage.safeArgumentRecord,
          );
          break;
        }
        case "ast-grep":
          commands = await runAstGrepCodemod(
            initializationMessage.path,
            message.path,
            message.data,
          );
          break;
        case "workflow":
          throw new Error("Workflow engine is not supported in worker threads");
        default:
          throw new Error(
            `Unknown codemod engine: ${initializationMessage.engine}`,
          );
      }

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
