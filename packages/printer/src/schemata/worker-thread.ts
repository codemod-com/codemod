import * as v from "valibot";

import { consoleKindSchema } from "./console-kind.js";

const workerThreadMessageSchema = v.union([
  v.object({
    kind: v.literal("commands"),
    commands: v.unknown(),
    path: v.optional(v.string()),
  }),
  v.object({
    kind: v.literal("error"),
    message: v.string(),
    path: v.optional(v.string()),
  }),
  v.object({
    kind: v.literal("console"),
    consoleKind: consoleKindSchema,
    message: v.string(),
  }),
]);

export type WorkerThreadMessage = v.InferOutput<
  typeof workerThreadMessageSchema
>;

export const decodeWorkerThreadMessage = (input: unknown) =>
  v.parse(workerThreadMessageSchema, input);
