import type TelemetryReporter from '@vscode/extension-telemetry';
import type { CaseHash } from '../cases/types';
import type { Message, MessageBus } from '../components/messageBus';
import { MessageKind } from '../components/messageBus';
import type { Job } from '../jobs/types';
import type { ErrorEvent, Event, Telemetry } from './telemetry';

export class VscodeTelemetry implements Telemetry {
	constructor(
		private readonly __telemetryReporter: TelemetryReporter,
		private readonly __messageBus: MessageBus,
	) {
		this.__messageBus.subscribe(
			MessageKind.codemodSetExecuted,
			(message) => {
				this.__onCodemodSetExecuted(message);
			},
		);

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
				kind: 'jobsAccepted',
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
				kind: 'jobsRejected',
				jobCount: jobs.length,
				executionId: caseHashDigest as CaseHash,
			});
		}
	}

	__onCodemodSetExecuted(
		message: Message & { kind: MessageKind.codemodSetExecuted },
	): void {
		this.sendEvent({
			kind: message.halted ? 'codemodHalted' : 'codemodExecuted',
			executionId: message.case.hash,
			fileCount: message.jobs.length,
			codemodName: message.case.codemodName,
		});
	}

	__rawEventToTelemetryEvent(event: ErrorEvent | Event): {
		properties: Record<string, string>;
		measurements: Record<string, number>;
		name: string;
	} {
		const properties: Record<string, string> = {};
		const measurements: Record<string, number> = {};

		for (const [key, value] of Object.entries(event)) {
			if (typeof value === 'string') {
				properties[key] = value;
				continue;
			}

			if (typeof value === 'number') {
				measurements[key] = value;
				continue;
			}
		}

		return {
			name: event.kind,
			properties,
			measurements,
		};
	}

	sendEvent(event: Event): void {
		const { name, properties, measurements } =
			this.__rawEventToTelemetryEvent(event);

		this.__telemetryReporter.sendTelemetryEvent(
			name,
			properties,
			measurements,
		);
	}

	sendError(event: ErrorEvent): void {
		const { name, properties, measurements } =
			this.__rawEventToTelemetryEvent(event);
		this.__telemetryReporter.sendTelemetryErrorEvent(
			name,
			properties,
			measurements,
		);
	}
}
