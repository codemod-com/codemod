import type { CaseHash } from "../cases/types";
import {
  type Message,
  type MessageBus,
  MessageKind,
} from "../components/messageBus";
import type { Job } from "../jobs/types";
import type { ErrorEvent, Event, Telemetry } from "./telemetry";

import type { TelemetryLogger } from "vscode";

export class VscodeTelemetryReporter implements Telemetry {
  constructor(
    private readonly __telemetryLogger: TelemetryLogger,
    private readonly __messageBus: MessageBus,
  ) {
    this.__messageBus.subscribe(MessageKind.jobsAccepted, (message) =>
      this.__onJobsAcceptedMessage(message),
    );

    this.__messageBus.subscribe(MessageKind.jobsRejected, (message) =>
      this.__onJobsRejectedMessage(message),
    );
  }

  __onJobsAcceptedMessage(
    message: Message & { kind: MessageKind.jobsAccepted },
  ): void {
    const { deletedJobs } = message;

    const jobsByExecution: Record<CaseHash, Job[]> = {};

    for (const job of deletedJobs) {
      const { caseHashDigest } = job;

      if (!jobsByExecution[caseHashDigest]) {
        jobsByExecution[caseHashDigest] = [];
      }

      jobsByExecution[caseHashDigest]?.push(job);
    }

    for (const [caseHashDigest, jobs] of Object.entries(jobsByExecution)) {
      this.sendEvent({
        kind: "jobsAccepted",
        jobCount: jobs.length,
        executionId: caseHashDigest as CaseHash,
      });
    }
  }

  __onJobsRejectedMessage(
    message: Message & { kind: MessageKind.jobsRejected },
  ): void {
    const { deletedJobs } = message;

    const jobsByExecution: Record<string, Job[]> = {};

    for (const job of deletedJobs) {
      const { caseHashDigest } = job;

      if (!jobsByExecution[caseHashDigest]) {
        jobsByExecution[caseHashDigest] = [];
      }

      jobsByExecution[caseHashDigest]?.push(job);
    }

    for (const [caseHashDigest, jobs] of Object.entries(jobsByExecution)) {
      this.sendEvent({
        kind: "jobsRejected",
        jobCount: jobs.length,
        executionId: caseHashDigest as CaseHash,
      });
    }
  }

  // transform path-like strings to bypass vscode logger filter
  __transformPathLikeName(str: string): string {
    return str.replaceAll("/", "_");
  }

  sendEvent(event: Event): void {
    this.__telemetryLogger.logUsage(event.kind, event);
  }

  sendError(event: ErrorEvent): void {
    this.__telemetryLogger.logError(event.kind, event);
  }
}
