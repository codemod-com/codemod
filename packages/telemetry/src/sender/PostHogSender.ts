import { PostHog } from "posthog-node";

import { redactFilePaths } from "../utils/redactFilePath.js";

import type {
	BaseEvent,
	TelemetrySender,
	TelemetrySenderOptions,
} from "../types.js";

export class PostHogSender<Event extends BaseEvent>
	implements TelemetrySender<Event>
{
	private __telemetryClient: PostHog;

	constructor(private readonly __options: TelemetrySenderOptions) {
		this.__telemetryClient = new PostHog(
			"phc_nGWKWP3t1fcNFqGi6UdstXjMf0fxx7SBeohHPSS6d2Y",
			{ host: "https://app.posthog.com" },
		);
	}

	public dispose(): Promise<unknown> {
		return this.__telemetryClient.shutdown();
	}

	public async sendEvent(event: Event): Promise<void> {
		const { kind, ...properties } = event;

		const redactedProperties = Object.entries(properties).reduce<
			Record<string, string>
		>((properties, [key, value]) => {
			properties[key] = redactFilePaths(value);

			return properties;
		}, {});

		this.__telemetryClient?.capture({
			distinctId: this.__options.distinctId,
			event: `codemod.${this.__options.cloudRole}.${kind}`,
			properties: {
				cloudRole: this.__options.cloudRole,
				...redactedProperties,
			},
		});
	}
}
