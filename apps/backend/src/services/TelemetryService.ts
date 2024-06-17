import { PostHogSender } from "@codemod-com/telemetry";
import type { TelemetryEvents } from "../telemetry";

export const telemetryService = new PostHogSender<TelemetryEvents>({
  cloudRole: "",
  distinctId: "",
});
