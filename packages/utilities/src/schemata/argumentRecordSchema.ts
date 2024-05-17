import {
	type Output,
	array,
	boolean,
	number,
	parse,
	record,
	safeParse,
	string,
	union,
} from 'valibot';

export let argumentSchema = union([
	string(),
	number(),
	boolean(),
	array(string()),
]);

export let argumentRecordSchema = record(string(), argumentSchema);

export type Argument = Output<typeof argumentSchema>;

export type ArgumentRecord = Output<typeof argumentRecordSchema>;

export let safeParseArgument = (input: unknown) =>
	safeParse(argumentSchema, input);

export let parseArgumentRecordSchema = (input: unknown) =>
	parse(argumentRecordSchema, input);
