import { PostHogSender } from "@codemod-com/telemetry";

import type { TelemetryEvents } from "../telemetry.js";

export const telemetryService = new PostHogSender<TelemetryEvents>({
  cloudRole: "",
  distinctId: "",
});
