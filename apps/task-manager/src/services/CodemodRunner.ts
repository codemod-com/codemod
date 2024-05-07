import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import type { CodemodMetadata } from "../jobs/runCodemod";
import { redis } from "./Redis";

enum CodemodRunnerStatus {
  IN_PROGRESS = "in_progress",
  FINISHED = "finished",
  ERROR = "error",
}

export type ExecutionProgress = {
  processed: number;
  total: number;
};

export class CodemodRunnerService {
  private readonly __sourcePath: string;
  private readonly __targetPath: string;
  private readonly __command: string;
  private __process: ChildProcessWithoutNullStreams | null;
  private __status: CodemodRunnerStatus;

  constructor(sourcePath: string, targetPath: string) {
    this.__command = "npx";
    this.__process = null;
    this.__sourcePath = sourcePath;
    this.__targetPath = targetPath;
    this.__status = CodemodRunnerStatus.FINISHED;
  }

  public async run(codemodMetadata: CodemodMetadata): Promise<void> {
    const { codemodEngine } = codemodMetadata;

    return new Promise<void>((resolve, reject) => {
      if (this.__status !== CodemodRunnerStatus.IN_PROGRESS) {
        this.__process = spawn(this.__command, [
          "codemod",
          `--source='${this.__sourcePath}'`,
          `--target='${this.__targetPath}'`,
          `--codemodEngine='${codemodEngine}'`,
          "--skip-install",
        ]);

        this.__status = CodemodRunnerStatus.IN_PROGRESS;

        this.__process.stdout.on("data", this.__stdOutHandler);
        this.__process.stderr.on("data", this.__stdErrHandler);

        this.__process.on(
          "close",
          async (code) => await this.__onCloseHandler(code, resolve, reject),
        );
      }
    });
  }

  private __stdOutHandler = async (data: Buffer): Promise<void> => {
    const message = data?.toString().trim();

    console.log(`[status]: executing codemod ${message}`);
    const progress = this.__extractStdOutProgress(message);

    await redis.set({
      status: "progress",
      progress,
    });
  };

  private __stdErrHandler = async (data: Buffer): Promise<void> => {
    const message = data?.toString().trim();

    console.error(`[error]: error executing codemod ${message}`);

    await redis.set({
      status: "error",
      message,
    });
  };

  private __onCloseHandler = async (
    code: number | null,
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: unknown) => void,
  ): Promise<void> => {
    switch (code) {
      case 0: {
        console.log("[status]: codemod executed");

        await redis.set({
          status: "progress",
          message: "codemod executed",
        });

        this.__status = CodemodRunnerStatus.FINISHED;

        resolve();
        break;
      }

      default: {
        console.error("[error]: codemod execution failed");

        await redis.set({
          status: "error",
          message: "codemod execution failed",
        });

        this.__status = CodemodRunnerStatus.ERROR;

        reject();
        break;
      }
    }
  };

  private __extractStdOutProgress = (
    message: string | undefined,
  ): ExecutionProgress | undefined => {
    if (message === undefined) {
      return undefined;
    }

    const match = message.match(/Processed (\d+) files out of (\d+)/);

    if (match && match.length >= 3) {
      const processed = Number(match[1]);
      const total = Number(match[2]);
      return { processed, total };
    }

    return undefined;
  };
}
