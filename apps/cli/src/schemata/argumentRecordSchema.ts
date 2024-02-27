import { type Output, boolean, number, record, string, union } from "valibot";

export const argumentRecordSchema = record(
	string(),
	union([string(), number(), boolean()]),
);

export type ArgumentRecord = Output<typeof argumentRecordSchema>;
