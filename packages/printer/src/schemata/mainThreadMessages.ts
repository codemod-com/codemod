import {
  argumentRecordSchema,
  engineOptionsSchema,
} from "@codemod-com/utilities";
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

const mainThreadMessageSchema = union([
  object({
    kind: literal("initialization"),
    codemodPath: string(),
    codemodSource: string(),
    codemodEngine: union([
      literal("jscodeshift"),
      literal("ts-morph"),
      literal("ast-grep"),
      literal("workflow"),
    ]),
    enablePrettier: boolean(),
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
