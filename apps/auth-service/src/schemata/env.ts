import {
  type InferOutput,
  array,
  object,
  parse,
  pipe,
  string,
  transform,
  unknown,
} from "valibot";

import { isNeitherNullNorUndefined } from "@codemod-com/utilities";

export const environmentSchema = object({
  PORT: pipe(string(), transform(Number)),
  ENCRYPTION_KEY: string(),
  CLERK_PUBLISH_KEY: string(),
  CLERK_SECRET_KEY: string(),
  CLERK_JWT_KEY: string(),
  APP_TOKEN_TEMPLATE: string(),
  ZITADEL_URL: string(),
  AUTH_OPENID_ISSUER: string(),
  CLIENT_ID: string(),
  REDIRECT_URL: string(),
  VERIFIED_PUBLISHERS: pipe(
    unknown(),
    transform((input) => {
      if (!isNeitherNullNorUndefined(input)) {
        return [];
      }

      if (Array.isArray(input)) {
        return parse(array(string()), input);
      }

      if (typeof input === "string") {
        return input.split(",").map((p) => p.trim());
      }

      return [];
    }),
  ),
});

export type Environment = InferOutput<typeof environmentSchema>;

export const parseEnvironment = (input: unknown) =>
  parse(environmentSchema, input);
