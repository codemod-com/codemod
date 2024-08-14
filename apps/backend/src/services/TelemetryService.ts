import { NullSender, PostHogSender } from "@codemod-com/telemetry";

import type { TelemetryEvents } from "../telemetry.js";
import { environment } from "../util.js";

export const telemetryService =
  environment.NODE_ENV === "production"
    ? new PostHogSender<TelemetryEvents>({ cloudRole: "", distinctId: "" })
    : new NullSender<TelemetryEvents>();
