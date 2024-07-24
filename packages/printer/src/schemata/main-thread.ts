import {
  type Output,
  boolean,
  literal,
  nullable,
  object,
  parse,
  string,
  union,
} from "valibot";

import {
  argumentRecordSchema,
  engineOptionsSchema,
} from "@codemod-com/utilities";

const mainThreadMessageSchema = union([
  object({
    kind: literal("initialization"),
    path: string(),
    codemodSource: string(),
    engine: union([
      literal("jscodeshift"),
      literal("ts-morph"),
      literal("ast-grep"),
      literal("workflow"),
    ]),
    format: boolean(),
    safeArgumentRecord: argumentRecordSchema,
    engineOptions: nullable(engineOptionsSchema),
  }),
  object({
    kind: literal("exit"),
  }),
  object({
    kind: literal("runCodemod"),
    path: string(),
    data: string(),
  }),
]);

export type MainThreadMessage = Output<typeof mainThreadMessageSchema>;

export const decodeMainThreadMessage = (input: unknown) =>
  parse(mainThreadMessageSchema, input);
