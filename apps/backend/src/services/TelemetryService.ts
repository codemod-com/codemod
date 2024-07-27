import { NullSender, PostHogSender } from "@codemod-com/telemetry";

import { environment } from "src/util.js";
import type { TelemetryEvents } from "../telemetry.js";

export const telemetryService =
  environment.NODE_ENV === "production"
    ? new PostHogSender<TelemetryEvents>({ cloudRole: "", distinctId: "" })
    : new NullSender<TelemetryEvents>();
