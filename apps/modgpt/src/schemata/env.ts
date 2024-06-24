import dotenv from "dotenv";
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

dotenv.config();
export const environmentSchema = object({
  NODE_ENV: string(),
  PORT: coerce(number(), (input) => Number(input)),
  OPEN_AI_API_KEY: string(),
  CLAUDE_API_KEY: string(),
  REPLICATE_API_KEY: string(),
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
