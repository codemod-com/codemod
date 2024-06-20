import {
	type LiteralSchema,
	array,
	literal,
	object,
	optional,
	parse,
	string,
	union,
} from 'valibot';
import { engines, roles } from '../dev-utils/consts';

let engine = union(
	engines.map((role) => literal(role)) as LiteralSchema<string>[],
);
let role = union(roles.map((role) => literal(role)) as LiteralSchema<string>[]);

export let sendChatBodySchema = object({
	messages: array(
		object({
			content: string(),
			role: string(),
			name: optional(string()),
		}),
	),
	engine: string(),
});

export let parseSendChatBody = (input: unknown) =>
	parse(sendChatBodySchema, input);
