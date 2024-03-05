import {
	type Output,
	array,
	boolean,
	literal,
	number,
	object,
	optional,
	string,
	union,
} from "valibot";

export const argumentsSchema = array(
	union([
		object({
			name: string(),
			kind: literal("string"),
			required: optional(boolean(), false),
			default: optional(string()),
		}),
		object({
			name: string(),
			kind: literal("number"),
			required: optional(boolean(), false),
			default: optional(number()),
		}),
		object({
			name: string(),
			kind: literal("boolean"),
			required: optional(boolean(), false),
			default: optional(boolean()),
		}),
	]),
);

export type Arguments = Output<typeof argumentsSchema>;
