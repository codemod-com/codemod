import dotenv from "dotenv";
import {
  type InferOutput,
  object,
  parse,
  pipe,
  string,
  transform,
} from "valibot";

dotenv.config();
export const environmentSchema = object({
  NODE_ENV: string(),
  PORT: pipe(
    string(),
    transform((input) => Number(input)),
  ),
  OPEN_AI_API_KEY: string(),
  CLAUDE_API_KEY: string(),
  REPLICATE_API_KEY: string(),
  AUTH_SERVICE_URL: string(),
});

export type Environment = InferOutput<typeof environmentSchema>;

export const parseEnvironment = (input: unknown) =>
  parse(environmentSchema, input);
