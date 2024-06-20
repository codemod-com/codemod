import { argumentRecordSchema } from '@codemod-com/utilities';
import {
	type Output,
	boolean,
	literal,
	object,
	parse,
	string,
	union,
} from 'valibot';

let mainThreadMessageSchema = union([
	object({
		kind: literal('initialization'),
		codemodPath: string(),
		codemodSource: string(),
		codemodEngine: union([
			literal('jscodeshift'),
			literal('ts-morph'),
			literal('ast-grep'),
		]),
		disablePrettier: boolean(),
		safeArgumentRecord: argumentRecordSchema,
	}),
	object({
		kind: literal('exit'),
	}),
	object({
		kind: literal('runCodemod'),
		path: string(),
		data: string(),
	}),
]);

export type MainThreadMessage = Output<typeof mainThreadMessageSchema>;

export let decodeMainThreadMessage = (input: unknown) =>
	parse(mainThreadMessageSchema, input);
