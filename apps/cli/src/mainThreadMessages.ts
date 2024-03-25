import {
	type Output,
	boolean,
	literal,
	object,
	parse,
	string,
	union,
} from "valibot";
import { argumentRecordSchema } from "./schemata/argumentRecordSchema.js";

const mainThreadMessageSchema = union([
	object({
		kind: literal("initialization"),
		codemodPath: string(),
		codemodSource: string(),
		codemodEngine: union([literal("jscodeshift"), literal("ts-morph")]),
		disablePrettier: boolean(),
		safeArgumentRecord: argumentRecordSchema,
	}),
	object({
		kind: literal("exit"),
	}),
	object({
		kind: literal("runCodemod"),
		path: string(),
		data: string(),
	}),
]);

export type MainThreadMessage = Output<typeof mainThreadMessageSchema>;

export const decodeMainThreadMessage = (input: unknown) =>
	parse(mainThreadMessageSchema, input);
