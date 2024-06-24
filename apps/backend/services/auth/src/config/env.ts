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
  AUTH_PORT: coerce(number(), (input) => Number(input)),
  ENCRYPTION_KEY: string(),
  CLERK_PUBLISH_KEY: string(),
  CLERK_SECRET_KEY: string(),
  CLERK_JWT_KEY: string(),
  APP_TOKEN_NAME: string(),
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
