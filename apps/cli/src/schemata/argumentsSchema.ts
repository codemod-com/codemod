import {
	Input,
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
			default: optional(string()),
		}),
		object({
			name: string(),
			kind: literal("number"),
			default: optional(number()),
		}),
		object({
			name: string(),
			kind: literal("boolean"),
			default: optional(boolean()),
		}),
	]),
);

export type Arguments = Input<typeof argumentsSchema>;
