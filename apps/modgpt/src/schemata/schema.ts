import {
  array,
  literal,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";

export const roles = ["system", "user", "assistant", "function"] as const;

export const sendChatBodySchema = object({
  messages: array(
    object({
      content: string(),
      role: union(roles.map((role) => literal(role))),
      name: optional(string()),
    }),
  ),
  engine: string(),
});

export const parseSendChatBody = (input: unknown) =>
  parse(sendChatBodySchema, input);
