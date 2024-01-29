import type { Contracts, TelemetryClient } from 'applicationinsights';
import { APP_INSIGHTS_TAG } from './constants.js';

export type Event =
	| Readonly<{
			kind: 'codemodExecuted';
			fileCount: number;
			executionId: string;
			codemodName: string;
	  }>
	| Readonly<{
			kind: 'failedToExecuteCommand';
			commandName: string;
	  }>;

export type TelemetryBlueprint = {
	sendEvent(event: Event): void;
};

const ALLOWED_ENVELOPE_TAGS = [
	'ai.device.osVersion',
	'ai.cloud.role',
	'ai.device.osArchitecture',
	'ai.device.osPlatform',
	'ai.internal.sdkVersion',
];

export class AppInsightsTelemetryService implements TelemetryBlueprint {
	constructor(private readonly __telemetryClient: TelemetryClient) {
		this.__telemetryClient.addTelemetryProcessor(this.__processTelemetry);
	}

	private __processTelemetry = (envelope: Contracts.EnvelopeTelemetry) => {
		const allowedTagEntries = Object.entries(envelope.tags).filter(
			([tagName]) => ALLOWED_ENVELOPE_TAGS.includes(tagName),
		);

		envelope.tags = Object.fromEntries(
			allowedTagEntries,
		) as Contracts.EnvelopeTelemetry['tags'];
		envelope.tags[this.__telemetryClient.context.keys.cloudRole] =
			APP_INSIGHTS_TAG;

		return true;
	};

	// AppInsights expects numeric values to be placed under "measurements" and string values under "properties"
	private __rawEventToTelemetryEvent(event: Event): Contracts.EventTelemetry {
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

	public sendEvent(event: Event): void {
		this.__telemetryClient.trackEvent(
			this.__rawEventToTelemetryEvent(event),
		);
	}
}

export class NoTelemetryService implements TelemetryBlueprint {
	public sendEvent(event: Event): void {}
}
