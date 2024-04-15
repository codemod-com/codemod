import type { Contracts, TelemetryClient } from "applicationinsights";

export const DEFAULT_ALLOWED_ENVELOPE_TAGS = [
	"ai.device.osVersion",
	"ai.cloud.role",
	"ai.device.osArchitecture",
	"ai.device.osPlatform",
	"ai.internal.sdkVersion",
];

export const APP_INSIGHTS_INSTRUMENTATION_STRING =
	"InstrumentationKey=d9f8ad27-50df-46e3-8acf-81ea279c8444;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/;LiveEndpoint=https://westus2.livediagnostics.monitor.azure.com/";

export type BaseEvent = { kind: string } & Record<string, unknown>;

export type TelemetryOptions = {
	cloudRole: string;
	allowedEnvelopeTags?: string[];
};

export type TelemetryBlueprint<Event extends BaseEvent> = {
	sendEvent(event: Event): void;
	dispose(): Promise<unknown>;
};

export class AppInsightsTelemetryService<Event extends BaseEvent>
	implements TelemetryBlueprint<Event>
{
	private __telemetryClient: TelemetryClient | null = null;

	constructor(private readonly __options: TelemetryOptions) {
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
		console.log("SENDING EVENT", event);
		this.__telemetryClient?.trackEvent(this.__rawEventToTelemetryEvent(event));
	}

	private async __setupTelemetryClient() {
		// hack to prevent appInsights from trying to read applicationinsights.json
		// this env should be set before appinsights is imported
		// https://github.com/microsoft/ApplicationInsights-node.js/blob/0217324c477a96b5dd659510bbccad27934084a3/Library/JsonConfig.ts#L122
		process.env.APPLICATIONINSIGHTS_CONFIGURATION_CONTENT = "{}";
		const appInsights = await import("applicationinsights");
		appInsights.setup(APP_INSIGHTS_INSTRUMENTATION_STRING);

		this.__telemetryClient = appInsights.defaultClient;
		this.__telemetryClient.addTelemetryProcessor(this.__processTelemetry);
	}

	// remove unnecessary info from the event (for GDPR compliance)
	private __processTelemetry = (envelope: Contracts.EnvelopeTelemetry) => {
		if (this.__telemetryClient === null) {
			return true;
		}

		const allowedTags =
			this.__options.allowedEnvelopeTags ?? DEFAULT_ALLOWED_ENVELOPE_TAGS;

		const allowedTagEntries = Object.entries(envelope.tags).filter(
			([tagName]) => allowedTags.includes(tagName),
		);

		envelope.tags = Object.fromEntries(
			allowedTagEntries,
		) as Contracts.EnvelopeTelemetry["tags"];

		envelope.tags[this.__telemetryClient.context.keys.cloudRole] =
			this.__options.cloudRole;

		return true;
	};

	// AppInsights expects numeric values to be placed under "measurements" and string values under "properties"
	private __rawEventToTelemetryEvent(event: Event): Contracts.EventTelemetry {
		const properties: Record<string, string> = {};
		const measurements: Record<string, number> = {};

		for (const [key, value] of Object.entries(event)) {
			if (typeof value === "string") {
				properties[key] = value;
				continue;
			}

			if (typeof value === "number") {
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

export class NoTelemetryService<Event extends BaseEvent>
	implements TelemetryBlueprint<Event>
{
	public sendEvent() {}
	public async dispose() {
		return Promise.resolve();
	}
}
