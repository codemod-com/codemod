import {
  type Output,
  literal,
  object,
  optional,
  parse,
  string,
  union,
  unknown,
} from "valibot";
import { consoleKindSchema } from "./schemata/consoleKindSchema.js";

const workerThreadMessageSchema = union([
  object({
    kind: literal("commands"),
    commands: unknown(),
    path: optional(string()),
  }),
  object({
    kind: literal("error"),
    message: string(),
    path: optional(string()),
  }),
  object({
    kind: literal("console"),
    consoleKind: consoleKindSchema,
    message: string(),
  }),
]);

export type WorkerThreadMessage = Output<typeof workerThreadMessageSchema>;

export const decodeWorkerThreadMessage = (input: unknown) =>
  parse(workerThreadMessageSchema, input);
