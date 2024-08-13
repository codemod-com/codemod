import * as v from "valibot";

export const argumentSchema = v.union([v.string(), v.number(), v.boolean()]);

export const argumentRecordSchema = v.record(v.string(), argumentSchema);

export type Argument = v.InferOutput<typeof argumentSchema>;

export type ArgumentRecord = v.InferOutput<typeof argumentRecordSchema>;

export const safeParseArgument = (input: unknown) =>
  v.safeParse(argumentSchema, input);

export const parseArgumentRecordSchema = (input: unknown) =>
  v.parse(argumentRecordSchema, input);
