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
  REDIS_HOST: optional(string()),
  REDIS_PORT: optional(string()),
  TASK_MANAGER_QUEUE_NAME: optional(string()),
  AUTH_SERVICE_URL: string(),
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
