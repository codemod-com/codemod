import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import {
  type Output,
  type ValiError,
  array,
  number,
  object,
  optional,
  parse,
  string,
  transform,
} from "valibot";

export const environmentSchema = object({
  PORT: transform(number(), (input) => Number(input)),
  X_CODEMOD_ACCESS_TOKEN: optional(string()),
  ENCRYPTION_KEY: string(),
  SIGNATURE_PRIVATE_KEY: string(),
  PEPPER: optional(string()),
  AWS_ACCESS_KEY_ID: optional(string()),
  AWS_SECRET_ACCESS_KEY: optional(string()),
  DATABASE_URI: string(),
  VERIFIED_PUBLISHERS: transform(array(string()), (input) => {
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
  OPEN_AI_API_KEY: optional(string()),
  CHROMA_BACKEND_URL: optional(string()),
  CLAUDE_API_KEY: optional(string()),
  CLERK_PUBLISH_KEY: optional(string()),
  CLERK_SECRET_KEY: optional(string()),
  CLERK_JWT_KEY: optional(string()),
  REPLICATE_API_KEY: optional(string()),
  REDIS_HOST: optional(string()),
  REDIS_PORT: optional(string()),
  TASK_MANAGER_QUEUE_NAME: optional(string()),
  POSTHOG_API_KEY: optional(string()),
  POSTHOG_PROJECT_ID: optional(string()),
});

export type Environment = Output<typeof environmentSchema>;

export const parseEnvironment = (input: unknown) => {
  const result = parse(environmentSchema, input);
  if (!result.success) {
    throw new Error(
      `Invalid environment: ${(result.error as ValiError).issues
        .map((i) => i.path?.join("."))
        .join(", ")}`,
    );
  }
  return result.data;
};
