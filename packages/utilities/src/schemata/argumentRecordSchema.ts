import {
  type Output,
  any,
  array,
  number,
  parse,
  record,
  safeParse,
  string,
  union,
} from "valibot";

export const argumentSchema = union([
  string(),
  number(),
  any(),
  array(string()),
]);

export const argumentRecordSchema = record(string(), argumentSchema);

export type Argument = Output<typeof argumentSchema>;

export type ArgumentRecord = Output<typeof argumentRecordSchema>;

export const safeParseArgument = (input: unknown) =>
  safeParse(argumentSchema, input);

export const parseArgumentRecordSchema = (input: unknown) =>
  parse(argumentRecordSchema, input);
