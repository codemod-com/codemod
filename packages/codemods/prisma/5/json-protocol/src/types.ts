import type { Schema } from "@mrleebo/prisma-ast";

export type RuleValue = "error" | "warn" | "off";

export type Dependencies = Readonly<{
  fetch: typeof fetch;
}>;

export type Options = Readonly<{
  schema: Schema | null;
}>;
