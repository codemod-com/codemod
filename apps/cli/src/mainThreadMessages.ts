import {
	Input,
	boolean,
	literal,
	object,
	parse,
	string,
	tuple,
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

export type MainThreadMessage = Input<typeof mainThreadMessageSchema>;

export const decodeMainThreadMessage = (input: unknown) =>
	parse(mainThreadMessageSchema, input);
