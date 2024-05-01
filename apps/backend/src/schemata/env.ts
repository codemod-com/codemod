import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import {
  type Output,
  type ValiError,
  array,
  coerce,
  literal,
  number,
  object,
  optional,
  parse,
  string,
} from "valibot";

export const environmentSchema = object({
  NODE_ENV: string(),
  PORT: coerce(number(), (input) => Number(input)),
  DATA: optional(string()),
  X_CODEMOD_ACCESS_TOKEN: optional(string()),
  CLERK_DISABLED: optional(literal("true")),
  // unused start
  ENCRYPTION_KEY: string(),
  SIGNATURE_PRIVATE_KEY: string(),
  PEPPER: optional(string()),
  AWS_ACCESS_KEY_ID: optional(string()),
  AWS_SECRET_ACCESS_KEY: optional(string()),
  DATABASE_URI: string(),
  VERIFIED_PUBLISHERS: coerce(array(string()), (input) => {
    if (!isNeitherNullNorUndefined(input)) {
      return [];
    }

    if (Array.isArray(input)) {
      return input;
    }

    if (typeof input === "string") {
      return input.split(",").map((p) => p.trim());
    }

    return [];
  }),
  // unused end
  OPEN_AI_API_KEY: optional(string()),
  CHROMA_BACKEND_URL: optional(string()),
  CLAUDE_API_KEY: optional(string()),
  CLERK_PUBLISH_KEY: optional(string()),
  CLERK_SECRET_KEY: optional(string()),
  CLERK_JWT_KEY: optional(string()),
  REPLICATE_API_KEY: optional(string()),
  REDIS_HOST: string(),
  REDIS_PORT: string(),
  TASK_MANAGER_QUEUE_NAME: string(),
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
