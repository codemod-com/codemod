import { randomBytes } from "node:crypto";
import { type ExtensionContext, env } from "vscode";
import type { ErrorEvent, Event } from "./telemetry";

import { PostHogSender } from "@codemod-com/telemetry";

const getOrCreateUserDistinctId = async (context: ExtensionContext) => {
	const distinctUserId = await context.globalState.get("distinctUserId");

	if (distinctUserId !== "string") {
		const newId = randomBytes(16).toString("hex");

		await context.globalState.update("distinctUserId", newId);

		return newId;
	}

	return distinctUserId;
};

export const buildTelemetryLogger = (context: ExtensionContext) => {
	const postHogSender = new PostHogSender<Event | ErrorEvent>({
		cloudRole: "VSCE",
		getUserDistinctId: () => getOrCreateUserDistinctId(context),
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
