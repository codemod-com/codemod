import {
  literal,
  object,
  optional,
  parse,
  string,
  tupleWithRest,
  union,
} from "valibot";

export const roles = ["system", "user", "assistant"] as const;
export const rolesWithName = ["function"] as const;
export const allRoles = [...roles, ...rolesWithName] as const;

const chatMessageSchema = union([
  object({
    content: string(),
    role: union(rolesWithName.map((r) => literal(r))),
    name: string(),
  }),
  object({
    content: string(),
    role: union(roles.map((r) => literal(r))),
    name: optional(string()),
  }),
]);

export const sendChatBodySchema = object({
  messages: tupleWithRest([chatMessageSchema], chatMessageSchema),
  engine: optional(string()),
});

export const parseSendChatBody = (input: unknown) =>
  parse(sendChatBodySchema, input);
