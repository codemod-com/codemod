import { PostHog } from "posthog-node";

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
			"phc_uOnV4eaTYjdAVaP7eL63Z2TRXcaVZ3guGKrERQam0eY",
			{ host: "https://eu.posthog.com" },
		);
	}

	public dispose(): Promise<unknown> {
		return this.__telemetryClient.shutdown();
	}

	public async sendEvent(event: Event): Promise<void> {
		const { kind, ...properties } = event;

		this.__telemetryClient?.capture({
			distinctId: this.__options.distinctId,
			event: kind,
			properties: { cloudRole: this.__options.cloudRole, ...properties },
		});
	}
}
