import * as v from "valibot";

import {
  argumentRecordSchema,
  engineOptionsSchema,
} from "@codemod-com/utilities";

const mainThreadMessageSchema = v.union([
  v.object({
    kind: v.literal("initialization"),
    path: v.string(),
    transformer: v.nullable(v.function()),
    engine: v.union([
      v.literal("jscodeshift"),
      v.literal("ts-morph"),
      v.literal("ast-grep"),
      v.literal("workflow"),
    ]),
    format: v.boolean(),
    safeArgumentRecord: argumentRecordSchema,
    engineOptions: v.nullable(engineOptionsSchema),
  }),
  v.object({
    kind: v.literal("exit"),
  }),
  v.object({
    kind: v.literal("runCodemod"),
    path: v.string(),
    data: v.string(),
  }),
]);

export type MainThreadMessage = v.InferOutput<typeof mainThreadMessageSchema>;

export const decodeMainThreadMessage = (input: unknown) =>
  v.parse(mainThreadMessageSchema, input);
