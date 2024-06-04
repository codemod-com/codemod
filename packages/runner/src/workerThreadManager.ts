import { dirname, join, resolve } from "node:path";
import { Worker } from "node:worker_threads";
import {
  type MainThreadMessage,
  type OperationMessage,
  type WorkerThreadMessage,
  decodeWorkerThreadMessage,
} from "@codemod-com/printer";
import type { ArgumentRecord, EngineOptions } from "@codemod-com/utilities";
import type { FormattedFileCommand } from "./fileCommands.js";
import type { CodemodExecutionErrorCallback } from "./schemata/callbacks.js";

export class WorkerThreadManager {
  private __idleWorkerIds: number[] = [];
  private __workers: Worker[] = [];
  private __workerTimestamps: number[] = [];
  private __filePaths: string[] = [];
  private __totalFileCount = 0;
  private __processedFileNumber = 0;
  private __noMorePaths = false;

  public constructor(
    private readonly __workerCount: number,
    private readonly __getData: (path: string) => Promise<string>,
    private readonly __onPrinterMessage: (
      message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
    ) => void,
    private readonly __onCommand: (
      command: FormattedFileCommand,
    ) => Promise<void>,
    private readonly __pathGenerator: AsyncGenerator<string, void, void>,
    codemodPath: string,
    codemodEngine: "ts-morph" | "jscodeshift" | "ast-grep",
    codemodSource: string,
    enablePrettier: boolean,
    safeArgumentRecord: ArgumentRecord,
    engineOptions: EngineOptions | null,
    private readonly onCodemodError: CodemodExecutionErrorCallback,
  ) {
    for (let i = 0; i < __workerCount; ++i) {
      this.__idleWorkerIds.push(i);
      this.__workerTimestamps.push(Date.now());

      const filename = process.env.TEST
        ? join(dirname(__filename), "../dist/index.cjs")
        : __filename;

      const worker = new Worker(filename);

      worker.on("message", this.__buildOnWorkerMessage(i));

      worker.postMessage({
        kind: "initialization",
        codemodPath,
        codemodEngine,
        codemodSource,
        enablePrettier,
        safeArgumentRecord,
        engineOptions,
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
    const iteratorResult = await this.__pathGenerator.next();

    if (iteratorResult.done) {
      console.log("No more paths");
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

    const data = await this.__getData(filePath);

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

    this.__onPrinterMessage({
      kind: "finish",
    });
  }

  private _getShouldFinish() {
    console.log(this.__noMorePaths);
    console.log(this.__totalFileCount !== null);
    console.log(this.__processedFileNumber === this.__totalFileCount);
    console.log(this.__idleWorkerIds.length === this.__workerCount);
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
        this.__onPrinterMessage(workerThreadMessage);
        return;
      }

      if (workerThreadMessage.kind === "commands") {
        const commands = workerThreadMessage.commands as FormattedFileCommand[];

        for (const command of commands) {
          await this.__onCommand(command);
        }
      } else if (workerThreadMessage.kind === "error") {
        this.onCodemodError({
          message: workerThreadMessage.message,
          filePath: workerThreadMessage.path ?? "",
        });
      }

      this.__onPrinterMessage({
        kind: "progress",
        processedFileNumber: ++this.__processedFileNumber,
        totalFileNumber: this.__totalFileCount,
        processedFileName: workerThreadMessage.path
          ? resolve(workerThreadMessage.path)
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
