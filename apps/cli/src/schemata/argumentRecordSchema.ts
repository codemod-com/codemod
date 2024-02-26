import { Input, boolean, number, record, string, union } from "valibot";

export const argumentRecordSchema = record(
	string(),
	union([string(), number(), boolean()]),
);

export type ArgumentRecord = Input<typeof argumentRecordSchema>;
