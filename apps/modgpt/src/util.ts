import { type Environment, parseEnvironment } from "./schemata/env.js";

export const areClerkKeysSet = (
  environment: Environment,
): environment is Omit<
  Environment,
  "CLERK_PUBLISH_KEY" | "CLERK_SECRET_KEY" | "CLERK_JWT_KEY"
> & {
  CLERK_PUBLISH_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_JWT_KEY: string;
} => {
  if (environment.CLERK_DISABLED === "true") {
    return false;
  }

  return (
    environment.CLERK_PUBLISH_KEY !== undefined &&
    environment.CLERK_SECRET_KEY !== undefined &&
    environment.CLERK_JWT_KEY !== undefined
  );
};

export const environment = parseEnvironment(process.env);
