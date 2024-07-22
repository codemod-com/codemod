import {
  type Output,
  type ValiError,
  array,
  coerce,
  number,
  object,
  parse,
  string,
} from "valibot";

import { isNeitherNullNorUndefined } from "@codemod-com/utilities";

export const environmentSchema = object({
  PORT: coerce(number(), (input) => Number(input)),
  ENCRYPTION_KEY: string(),
  CLERK_PUBLISH_KEY: string(),
  CLERK_SECRET_KEY: string(),
  CLERK_JWT_KEY: string(),
  APP_TOKEN_TEMPLATE: string(),
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
