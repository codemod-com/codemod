import {
	type Output,
	boolean,
	number,
	parse,
	record,
	string,
	union,
} from "valibot";

export const argumentRecordSchema = record(
	string(),
	union([string(), number(), boolean()]),
);

export type ArgumentRecord = Output<typeof argumentRecordSchema>;

export const parseArgumentRecordSchema = (input: unknown) =>
	parse(argumentRecordSchema, input);
