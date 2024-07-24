import { dirname, join, relative, resolve } from "node:path";
import { Worker } from "node:worker_threads";

import {
  type MainThreadMessage,
  type OperationMessage,
  type WorkerThreadMessage,
  decodeWorkerThreadMessage,
} from "@codemod-com/printer";
import type {
  CodemodConfig,
  FileCommand,
  FileSystem,
  KnownEnginesCodemod,
} from "@codemod-com/utilities";
import type { CodemodExecutionErrorCallback } from "./schemata/callbacks.js";
import type { FlowSettings } from "./schemata/flow-settings.js";

export class WorkerManager {
  private __idleWorkerIds: number[] = [];
  private __workers: Worker[] = [];
  private __workerTimestamps: number[] = [];
  private __filePaths: string[] = [];
  private __totalFileCount = 0;
  private __processedFileNumber = 0;
  private __noMorePaths = false;
  private __workerCount = 4;

  public constructor(
    private readonly _options: {
      fileSystem: FileSystem;
      onPrinterMessage: (
        message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
      ) => void;
      flowSettings: FlowSettings;
      onCommand: (command: FileCommand) => Promise<void>;
      pathGenerator: AsyncGenerator<string, void, void>;
      codemod: KnownEnginesCodemod & {
        config: CodemodConfig & {
          engine: "jscodeshift" | "ts-morph" | "ast-grep";
        };
      };
      codemodSource: string;
      onError?: CodemodExecutionErrorCallback;
    },
  ) {
    const { codemod, codemodSource, flowSettings } = _options;

    this.__workerCount = flowSettings.threads;

    for (let i = 0; i < this.__workerCount; ++i) {
      this.__idleWorkerIds.push(i);
      this.__workerTimestamps.push(Date.now());

      const filename = process.env.TEST
        ? join(dirname(__filename), "../dist/index.cjs")
        : __filename;

      const worker = new Worker(filename);

      worker.on("message", this.__buildOnWorkerMessage(i));

      worker.postMessage({
        kind: "initialization",
        codemodSource,
        ...codemod,
        ...codemod.config,
        ...flowSettings,
      } satisfies MainThreadMessage);

      this.__workers.push(worker);
    }

    this.__pullNewPath();
  }

  public async terminateWorkers() {
    for (const worker of this.__workers) {
      await worker.terminate();
    }
  }

  private async __pullNewPath() {
    const iteratorResult = await this._options.pathGenerator.next();

    if (iteratorResult.done) {
      this.__noMorePaths = true;

      if (this._getShouldFinish()) {
        await this.__finish();
      }

      return;
    }

    ++this.__totalFileCount;

    this.__filePaths.push(iteratorResult.value);

    await this.__work();

    await this.__pullNewPath();
  }

  private async __work(): Promise<void> {
    const filePath = this.__filePaths.shift();

    if (filePath === undefined) {
      return;
    }

    const id = this.__idleWorkerIds.pop();

    if (id === undefined) {
      this.__filePaths.push(filePath);

      return;
    }

    const data = (await this._options.fileSystem.promises.readFile(filePath, {
      encoding: "utf8",
    })) as string;

    this.__workers[id]?.postMessage({
      kind: "runCodemod",
      path: filePath,
      data,
    } satisfies MainThreadMessage);

    this.__workerTimestamps[id] = Date.now();

    await this.__work();
  }

  private async __finish(): Promise<void> {
    for (const worker of this.__workers) {
      worker.postMessage({ kind: "exit" } satisfies MainThreadMessage);
    }

    this._options.onPrinterMessage({
      kind: "finish",
    });
  }

  private _getShouldFinish() {
    return (
      this.__noMorePaths &&
      this.__totalFileCount !== null &&
      this.__processedFileNumber === this.__totalFileCount &&
      this.__idleWorkerIds.length === this.__workerCount
    );
  }

  private __buildOnWorkerMessage(i: number) {
    return async (m: unknown): Promise<void> => {
      const workerThreadMessage = decodeWorkerThreadMessage(m);

      if (workerThreadMessage.kind === "console") {
        this._options.onPrinterMessage(workerThreadMessage);
        return;
      }

      if (workerThreadMessage.kind === "commands") {
        const commands = workerThreadMessage.commands as FileCommand[];

        for (const command of commands) {
          await this._options.onCommand(command);
        }
      } else if (workerThreadMessage.kind === "error") {
        this._options.onError?.({
          message: workerThreadMessage.message,
          filePath: workerThreadMessage.path ?? "",
        });
      }

      this._options.onPrinterMessage({
        kind: "progress",
        processedFileNumber: ++this.__processedFileNumber,
        totalFileNumber: this.__totalFileCount,
        processedFileName: workerThreadMessage.path
          ? relative(
              this._options.flowSettings.target,
              resolve(workerThreadMessage.path),
            )
          : null,
      });

      this.__idleWorkerIds.push(i);

      if (this._getShouldFinish()) {
        await this.__finish();
        return;
      }

      await this.__work();
    };
  }
}
