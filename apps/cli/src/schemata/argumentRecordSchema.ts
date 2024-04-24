import {
  type Output,
  array,
  boolean,
  number,
  record,
  string,
  union,
} from "valibot";

export const argumentRecordSchema = record(
  string(),
  union([string(), number(), boolean(), array(string())]),
);

export type ArgumentRecord = Output<typeof argumentRecordSchema>;
