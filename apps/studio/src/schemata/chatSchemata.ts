/* eslint-disable import/group-exports */
import * as S from "@effect/schema/Schema";
import type { Message } from "ai";

const frozenMessageSchema = S.struct({
	id: S.string,
	createdAt: S.optional(S.number),
	content: S.string,
	role: S.union(
		S.literal("system"),
		S.literal("user"),
		S.literal("assistant"),
		S.literal("function"),
	),
	name: S.optional(S.string),
	functionCall: S.optional(S.string),
});

type FrozenMessage = S.To<typeof frozenMessageSchema>;

export const parseFrozenMessages = S.parseSync(S.array(frozenMessageSchema));

export const freezeMessage = (message: Message): FrozenMessage => ({
	id: message.id,
	createdAt: message.createdAt?.getTime(),
	content: message.content,
	role:
		message.role === "data" || message.role === "tool"
			? "system"
			: message.role,
	name: message.name,
	functionCall:
		typeof message.function_call === "string"
			? message.function_call
			: undefined,
});

export const unfreezeMessage = (frozenMessage: FrozenMessage): Message => ({
	id: frozenMessage.id,
	createdAt:
		frozenMessage.createdAt !== undefined
			? new Date(frozenMessage.createdAt)
			: undefined,
	content: frozenMessage.content,
	role: frozenMessage.role,
	name: frozenMessage.name,
	function_call: frozenMessage.functionCall,
});
