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
      "phc_nGWKWP3t1fcNFqGi6UdstXjMf0fxx7SBeohHPSS6d2Y",
      { host: "https://app.posthog.com" },
    );
  }

  public dispose(): Promise<unknown> {
    return this.__telemetryClient.shutdown();
  }

  public async sendEvent(event: Event): Promise<void> {
    const { kind, ...properties } = event;

    this.__telemetryClient?.capture({
      distinctId: this.__options.distinctId,
      event: `codemod.${this.__options.cloudRole}.${kind}`,
      properties: { cloudRole: this.__options.cloudRole, ...properties },
    });
  }
}
