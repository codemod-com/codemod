import { setTimeout } from "node:timers/promises";
import type { Printer } from "@codemod-com/printer";
import type { RunnerServiceInterface } from "@codemod-com/runner";
import { CodemodCloudRunnerAbstract } from "@codemod-com/runner";
import Axios from "axios";
import { getCurrentUserOrLogin } from "#auth-utils.js";

const STATUS_POLL_INTERVAL = 5000;
const OUTPUT_POLL_INTERVAL = 1000;

enum CodemodRunStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  FINISHED = "finished",
  ERROR = "error",
}

class CodemodCloudRunner extends CodemodCloudRunnerAbstract {
  private status: CodemodRunStatus = CodemodRunStatus.PENDING;
  private runId: string | undefined;

  constructor(
    private token: string,
    private source: string,
    private engine: string,
  ) {
    super();
  }

  async start() {
    const response = await Axios.post<{
      success: boolean;
      codemodRunId: string;
    }>(
      `${process.env.RUNNER_URL}/codemodRun`,
      {
        codemodSource: this.source,
        codemodEngine: this.engine,
      },
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    const { success, codemodRunId } = response.data;
    if (success) {
      this.runId = codemodRunId;
      this.status = CodemodRunStatus.IN_PROGRESS;
    } else {
      this.status = CodemodRunStatus.ERROR;
    }
  }

  async waitForCompletion() {
    while (this.status === CodemodRunStatus.IN_PROGRESS) {
      try {
        await setTimeout(STATUS_POLL_INTERVAL);
        const { data } = await Axios.get<{
          success: boolean;
          result: { status: string; message: string };
        }>(`${process.env.RUNNER_URL}/codemodRun/status/${this.runId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        if (!data.success) {
          throw new Error("Runner returned false");
        }
        if (
          data.result.message === "codemod executed" ||
          data.result.status === CodemodRunStatus.FINISHED
        ) {
          this.status = CodemodRunStatus.FINISHED;
          return;
        }
      } catch (e) {
        this.status = CodemodRunStatus.ERROR;
      }
    }
  }

  async printOutput() {
    while (this.status === CodemodRunStatus.IN_PROGRESS) {
      try {
        await setTimeout(OUTPUT_POLL_INTERVAL);
        const { data } = await Axios.get<{
          success: boolean;
          output: string | null;
        }>(`${process.env.RUNNER_URL}/codemodRun/output/${this.runId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        if (data.success && data.output) {
          process.stdout.write(data.output);
        }
      } catch (e) {
        //
      }
    }
  }
}

export class RunnerService implements RunnerServiceInterface {
  constructor(private printer: Printer) {}

  async startCodemodRun(params: {
    source: string;
    engine: "workflow";
  }): Promise<CodemodCloudRunner> {
    const { source, engine } = params;
    try {
      const { token } = await getCurrentUserOrLogin({
        message:
          "Authentication is required to view your own codemods. Proceed?",
        printer: this.printer,
        onEmptyAfterLoginText: "Failed login. Please try again. Aborting...",
      });

      const cloudRunner = new CodemodCloudRunner(token, source, engine);
      await cloudRunner.start();
      cloudRunner.printOutput();
      await cloudRunner.waitForCompletion();

      return cloudRunner;
    } catch (error) {
      if (Axios.isAxiosError(error)) {
        if (error.response?.data) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error("Failed to start codemod run");
    }
  }
}
