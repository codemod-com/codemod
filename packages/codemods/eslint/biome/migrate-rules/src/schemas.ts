import { any, object, optional, record, string, tuple } from "valibot";

export const valibotEslintSchema = object({
  rules: record(string(), tuple([string()])),
});

export const packageJsonSchema = object({
  name: optional(string()),
  dependencies: optional(record(string(), string())),
  devDependencies: optional(record(string(), string())),
  scripts: optional(record(string(), string())),
  eslintConfig: optional(any()),
  eslintIgnore: optional(any()),
  packageManager: optional(string()),
});
