import { env } from "vscode";
import type { ErrorEvent, Event } from "./telemetry";

import { PostHogSender } from "@codemod-com/telemetry";

export const buildTelemetryLogger = (distinctId: string) => {
	const postHogSender = new PostHogSender<Event | ErrorEvent>({
		cloudRole: "VSCE",
		distinctId,
	});

	const telemetrySender = {
		sendEventData(
			eventName: Event["kind"] | ErrorEvent["kind"],
			data?: Record<string, unknown> | undefined,
		): void {
			postHogSender.sendEvent({ kind: eventName, ...data } as Event);
		},
		sendErrorData(): void {},
	};

	/**
	 * Extensions must NOT call the methods of
	 * their sender directly as the logger provides extra guards and cleaning.
	 *
	 * Logger guarantees that user's Vscode telemetry settings are respected.
	 * see https://vscode-api.js.org/interfaces/vscode.TelemetryLogger.html
	 *
	 */
	return env.createTelemetryLogger(telemetrySender);
};
