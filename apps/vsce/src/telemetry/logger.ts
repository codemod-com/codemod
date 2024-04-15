import type { ErrorEvent, Event } from "./telemetry";

import { env } from "vscode";

import { ApplicationInsightsSender } from "@codemod-com/telemetry";

const appInsightsService = new ApplicationInsightsSender<Event | ErrorEvent>({
	cloudRole: "VSCE",
});

const telemetrySender = {
	sendEventData(
		eventName: Event["kind"] | ErrorEvent["kind"],
		data?: Record<string, unknown> | undefined,
	): void {
		appInsightsService.sendEvent({ kind: eventName, ...data } as Event);
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
export const telemetryLogger = env.createTelemetryLogger(telemetrySender);
