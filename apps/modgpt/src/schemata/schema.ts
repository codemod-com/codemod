import {
  array,
  literal,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";

const engineSchema = union([
  literal("claude-2.0"),
  literal("claude-instant-1.2"),
  literal("replit-code-v1-3b"),
  literal("gpt-4-with-chroma"),
  literal("gpt-4"),
]);

export const sendChatBodySchema = object({
  messages: array(
    object({
      content: string(),
      role: union([literal("system"), literal("user"), literal("assistant")]),
      name: optional(string()),
    }),
  ),
  engine: engineSchema,
});

export const parseSendChatBody = (input: unknown) =>
  parse(sendChatBodySchema, input);
