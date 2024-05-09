import {
  type Output,
  type ValiError,
  coerce,
  number,
  object,
  optional,
  parse,
  string,
} from "valibot";

export const environmentSchema = object({
  PORT: coerce(number(), (input) => Number(input)),
  OPEN_AI_API_KEY: string(),
  CLAUDE_API_KEY: string(),
  REPLICATE_API_KEY: string(),
  CLERK_DISABLED: optional(string()),
  CLERK_PUBLISH_KEY: optional(string()),
  CLERK_SECRET_KEY: optional(string()),
  CLERK_JWT_KEY: optional(string()),
  X_CODEMOD_ACCESS_TOKEN: optional(string()),
});

export type Environment = Output<typeof environmentSchema>;

export const parseEnvironment = (input: unknown) => {
  try {
    return parse(environmentSchema, input);
  } catch (err) {
    throw new Error(
      `Invalid environment: ${(err as ValiError).issues
        .map((i) => i.path?.map((p) => p.key).join("."))
        .join(", ")}`,
    );
  }
};
