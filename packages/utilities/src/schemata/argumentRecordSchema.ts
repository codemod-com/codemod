import * as v from "valibot";
import type { Output } from "valibot";

export const argumentSchema = v.union([
  v.string(),
  v.number(),
  v.boolean(),
  v.array(v.string()),
]);

export const argumentRecordSchema = v.record(v.string(), argumentSchema);

export type Argument = Output<typeof argumentSchema>;

export type ArgumentRecord = Output<typeof argumentRecordSchema>;

export const safeParseArgument = (input: unknown) =>
  v.safeParse(argumentSchema, input);

export const parseArgumentRecordSchema = (input: unknown) =>
  v.parse(argumentRecordSchema, input);
