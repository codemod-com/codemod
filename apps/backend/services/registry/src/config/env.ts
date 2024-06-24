import {
  type Output,
  type ValiError,
  coerce,
  number,
  object,
  parse,
  string,
} from "valibot";

export const ENV = object({
  NODE_ENV: string(),
  REGISTRY_PORT: coerce(number(), (input) => Number(input)),
  DATABASE_URI: string(),
  AWS_ACCESS_KEY_ID: string(),
  AWS_SECRET_ACCESS_KEY: string(),
});

export type Environment = Output<typeof ENV>;

const parseEnv = (input: unknown) => {
  try {
    return parse(ENV, input);
  } catch (error) {
    const issues = (error as ValiError).issues
      .map((issue) => issue.path?.map((path) => path.key).join("."))
      .join(", ");

    throw new Error(`Invalid environment: ${issues}`);
  }
};

export const env = parseEnv(process.env);
