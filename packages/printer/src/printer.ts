import chalk from "chalk";
import cliProgress from "cli-progress";
import ora, { type Ora } from "ora";
import type { ConsoleKind } from "./schemata/console-kind.js";
import type { OperationMessage, ProgressMessage } from "./schemata/messages.js";
import type { WorkerThreadMessage } from "./schemata/worker-thread.js";

export class Printer {
  protected progressBar: cliProgress.SingleBar | null = null;

  public constructor(public readonly __jsonOutput = false) {}

  public printMessage(
    message: OperationMessage | (WorkerThreadMessage & { kind: "console" }),
  ) {
    if (message.kind === "console") {
      return this.printConsoleMessage(message.consoleKind, message.message);
    }

    return this.printOperationMessage(message);
  }

  public printOperationMessage(message: OperationMessage) {
    if (this.__jsonOutput) {
      if (message.kind === "error") {
        console.error(chalk.red(`\n${JSON.stringify(message)}\n`));
        return;
      }

      console.log(JSON.stringify(message));
      return;
    }

    if (message.kind === "error") {
      const { message: text, path } = message;

      let errorText: string = text;

      if (path) {
        errorText = `${chalk.bold("Error at", `${path}:`)}\n\n${text}`;
      }

      console.error(chalk.red(`\n${errorText}\n`));
      return;
    }

    if (message.kind === "progress") {
      this.updateExecutionProgress(message);
    }

    if (message.kind === "finish") {
      this.terminateExecutionProgress();
    }
  }

  public printConsoleMessage(kind: ConsoleKind, message: string) {
    if (this.__jsonOutput) {
      return null;
    }

    if (kind === "warn") {
      console.warn(chalk.yellow(message));
    }

    if (kind === "error") {
      console.error(chalk.red(message));
      return null;
    }

    return console[kind](message);
  }

  public updateExecutionProgress(message: ProgressMessage) {
    if (!this.progressBar) {
      this.progressBar = new cliProgress.SingleBar({
        format: `Execution progress | ${chalk.cyan(
          "{bar}",
        )} | {percentage}% || {value}/{total} files || Current: {file}`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
      });

      this.progressBar.start(message.totalFileNumber, 0);
    }

    this.progressBar.update(message.processedFileNumber, {
      file: message.processedFileName
        ? chalk.bold(message.processedFileName)
        : "N/A",
    });

    if (this.progressBar.getTotal() !== message.totalFileNumber) {
      this.progressBar.setTotal(message.totalFileNumber);
    }
  }

  public terminateExecutionProgress() {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }

  public withLoaderMessage(text: string): Ora {
    return ora({ text, color: "cyan" }).start();
  }
}
