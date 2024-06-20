import type { Contracts, TelemetryClient } from 'applicationinsights';
import type {
	BaseEvent,
	TelemetrySender,
	TelemetrySenderOptions,
} from '../types.js';

// see Declarations/Contracts/Generated/ContextTagKeys.ts
// tags are assigned internally by `applicationinsights`
export let DEFAULT_ALLOWED_CONTEXT_TAGS = [
	'ai.cloud.role',
	'ai.device.osVersion',
	'ai.device.osArchitecture',
	'ai.device.osPlatform',
	'ai.internal.sdkVersion',
];

export let APP_INSIGHTS_INSTRUMENTATION_STRING =
	'InstrumentationKey=d9f8ad27-50df-46e3-8acf-81ea279c8444;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/;LiveEndpoint=https://westus2.livediagnostics.monitor.azure.com/';

export class ApplicationInsightsSender<Event extends BaseEvent>
	implements TelemetrySender<Event>
{
	private __telemetryClient: TelemetryClient | null = null;

	constructor(private readonly __options: TelemetrySenderOptions) {
		this.__setupTelemetryClient();
	}

	public dispose(): Promise<unknown> {
		return new Promise((resolve) => {
			this.__telemetryClient?.flush({
				callback: resolve,
			});
		});
	}

	public sendEvent(event: Event): void {
		this.__telemetryClient?.trackEvent(
			this.__rawEventToTelemetryEvent(event),
		);
	}

	private async __setupTelemetryClient() {
		// hack to prevent appInsights from trying to read applicationinsights.json
		// this env should be set before appinsights is imported
		// https://github.com/microsoft/ApplicationInsights-node.js/blob/0217324c477a96b5dd659510bbccad27934084a3/Library/JsonConfig.ts#L122
		process.env.APPLICATIONINSIGHTS_CONFIGURATION_CONTENT = '{}';
		let appInsights = await import('applicationinsights');
		appInsights.setup(APP_INSIGHTS_INSTRUMENTATION_STRING);

		this.__telemetryClient = appInsights.defaultClient;
		this.__telemetryClient.addTelemetryProcessor(this.__processTelemetry);
	}

	// remove unnecessary info from the event (for GDPR compliance), enforce correct cloudRole
	private __processTelemetry = (envelope: Contracts.EnvelopeTelemetry) => {
		if (this.__telemetryClient === null) {
			return true;
		}

		let allowedTags =
			this.__options.allowedEnvelopeTags ?? DEFAULT_ALLOWED_CONTEXT_TAGS;

		let allowedTagEntries = Object.entries(envelope.tags).filter(
			([tagName]) => allowedTags.includes(tagName),
		);

		envelope.tags = Object.fromEntries(
			allowedTagEntries,
		) as Contracts.EnvelopeTelemetry['tags'];

		envelope.tags[this.__telemetryClient.context.keys.cloudRole] =
			this.__options.cloudRole;

		return true;
	};

	// AppInsights expects numeric values to be placed under "measurements" and string values under "properties"
	private __rawEventToTelemetryEvent(event: Event): Contracts.EventTelemetry {
		let properties: Record<string, string> = {};
		let measurements: Record<string, number> = {};

		for (let [key, value] of Object.entries(event)) {
			if (typeof value === 'string') {
				properties[key] = value;
				continue;
			}

			if (typeof value === 'number') {
				measurements[key] = value;
			}
		}

		return {
			name: `codemod.${this.__options.cloudRole}.${event.kind}`,
			properties,
			measurements,
		};
	}
}
