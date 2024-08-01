import type { Message } from "ai";
import {
  type InferOutput,
  array,
  literal,
  number,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";

const frozenMessageSchema = object({
  id: string(),
  createdAt: optional(number()),
  content: string(),
  role: union([
    literal("system"),
    literal("user"),
    literal("assistant"),
    literal("function"),
  ]),
  name: optional(string()),
  functionCall: optional(string()),
});

type FrozenMessage = InferOutput<typeof frozenMessageSchema>;

export const parseFrozenMessages = (input: unknown) =>
  parse(array(frozenMessageSchema), input);

export const freezeMessage = (message: Message): FrozenMessage => ({
  id: message.id,
  createdAt: message.createdAt?.getTime(),
  content: message.content,
  role: message.role === "data" ? "system" : message.role,
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
