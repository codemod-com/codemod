import type { CaseHash } from "../cases/types";
import {
  type Message,
  type MessageBus,
  MessageKind,
} from "../components/messageBus";
import type { Job } from "../jobs/types";
import type { ErrorEvent, Event, Telemetry } from "./telemetry";

import { type TelemetryLogger, type TelemetrySender, env } from "vscode";

import { AppInsightsTelemetryService, BaseEvent } from "@codemod-com/telemetry";

export class VSCodeTelemetrySender<Event extends BaseEvent>
  implements TelemetrySender
{
  constructor(
    private readonly __appInsights: AppInsightsTelemetryService<Event>
  ) {}

  sendEventData(
    eventName: Event["kind"],
    data?: Record<string, unknown> | undefined
  ): void {
    this.__appInsights.sendEvent({ kind: eventName, ...data } as Event);
  }

  sendErrorData(): void {}
}

export class VscodeTelemetry implements Telemetry {
  private __telemetryLogger: TelemetryLogger;

  constructor(private readonly __messageBus: MessageBus) {
    this.__messageBus.subscribe(MessageKind.codemodSetExecuted, (message) => {
      this.__onCodemodSetExecuted(message);
    });

    this.__messageBus.subscribe(MessageKind.jobsAccepted, (message) =>
      this.__onJobsAcceptedMessage(message)
    );

    this.__messageBus.subscribe(MessageKind.jobsRejected, (message) =>
      this.__onJobsRejectedMessage(message)
    );

    const appInsightsService = new AppInsightsTelemetryService<
      Event | ErrorEvent
    >({
      cloudRole: "VSCE",
    });

    const telemetrySender = new VSCodeTelemetrySender(appInsightsService);

    /**
     * Extensions must NOT call the methods of
     * their sender directly as the logger provides extra guards and cleaning.
     *
     * Logger guarantees that user's Vscode telemetry settings are respected.
     * see https://vscode-api.js.org/interfaces/vscode.TelemetryLogger.html
     */
    this.__telemetryLogger = env.createTelemetryLogger(telemetrySender);
  }

  __onJobsAcceptedMessage(
    message: Message & { kind: MessageKind.jobsAccepted }
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
    message: Message & { kind: MessageKind.jobsRejected }
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

  __onCodemodSetExecuted(
    message: Message & { kind: MessageKind.codemodSetExecuted }
  ): void {
    this.sendEvent({
      kind: message.halted ? "codemodHalted" : "codemodExecuted",
      executionId: message.case.hash,
      fileCount: message.jobs.length,
      codemodName: message.case.codemodName,
    });
  }

  sendEvent(event: Event): void {
    this.__telemetryLogger.logUsage(event.kind, event);
  }

  // @TEMP treating Error as regular event
  sendError(event: ErrorEvent): void {
    this.__telemetryLogger.logUsage(event.kind, event);
  }
}
