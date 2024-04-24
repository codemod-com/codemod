export { ApplicationInsightsSender } from "./sender/ApplicationInsightsSender.js";
export { PostHogSender } from "./sender/PostHogSender.js";
export { NullSender } from "./sender/NullSender.js";

export type {
  BaseEvent,
  TelemetrySenderOptions,
  TelemetrySender,
} from "./types.js";
