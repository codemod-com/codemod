import {
	type Output,
	array,
	boolean,
	number,
	parse,
	record,
	string,
	union,
} from 'valibot';

export let argumentRecordSchema = record(
	string(),
	union([string(), number(), boolean(), array(string())]),
);

export type ArgumentRecord = Output<typeof argumentRecordSchema>;

export let parseArgumentRecordSchema = (input: unknown) =>
	parse(argumentRecordSchema, input);
