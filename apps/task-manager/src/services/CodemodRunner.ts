import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import type { CodemodMetadata } from "../jobs/runCodemod";
import { redis } from "./Redis";

enum CodemodRunnerStatus {
  IN_PROGRESS = "in_progress",
  FINISHED = "finished",
  ERROR = "error",
}

export class CodemodRunnerService {
  private readonly __sourcePath: string;
  private readonly __targetPath: string;
  private readonly __command: string;
  private __process: ChildProcessWithoutNullStreams | null;
  private __status: CodemodRunnerStatus;

  constructor(sourcePath: string, targetPath: string) {
    this.__sourcePath = sourcePath;
    this.__targetPath = targetPath;
    this.__process = null;
    this.__command = "npx";
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

        this.__process.stdout.on("data", this.stdOutHandler);
        this.__process.stderr.on("data", this.stdErrHandler);

        this.__process.on(
          "close",
          async (code) => await this.onCloseHandler(code, resolve, reject),
        );
      }
    });
  }

  private async stdOutHandler(data: unknown): Promise<void> {
    const message = (data as any)
      .toString()
      .trim()
      .match(/Processed \d+ files out of \d+/)[0];

    console.log(`[status]: executing codemod ${message}`);

    await redis.set({
      status: "progress",
      message,
    });
  }

  private async stdErrHandler(data: unknown): Promise<void> {
    const message = (data as any).toString().trim();

    console.error(`[error]: error executing codemod ${message}`);

    await redis.set({
      status: "error",
      message,
    });
  }

  private async onCloseHandler(
    code: number | null,
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: unknown) => void,
  ): Promise<void> {
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
  }
}
