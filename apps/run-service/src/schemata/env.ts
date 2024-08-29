import {
  type InferOutput,
  object,
  optional,
  parse,
  pipe,
  string,
  transform,
} from "valibot";

export const environmentSchema = object({
  PORT: pipe(string(), transform(Number)),
  NODE_ENV: string(),
  DATABASE_URI: string(),
  REDIS_HOST: optional(string()),
  REDIS_PORT: optional(string()),
  TASK_MANAGER_QUEUE_NAME: optional(string()),
  AUTH_SERVICE_URL: string(),
});

export type Environment = InferOutput<typeof environmentSchema>;

export const parseEnvironment = (input: unknown) =>
  parse(environmentSchema, input);
