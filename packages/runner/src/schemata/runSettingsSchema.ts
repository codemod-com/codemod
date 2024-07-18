import { existsSync } from "node:fs";
import {
  type Output,
  array,
  literal,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";

const codemodEngineSchema = union([
  literal("jscodeshift"),
  literal("filemod"),
  literal("ts-morph"),
  literal("ast-grep"),
  literal("workflow"),
]);

export const runSettingsSchema = object({
  _: array(string()),
  source: optional(string()),
  engine: optional(codemodEngineSchema),
});

export type RunSettings =
  | Readonly<{
      kind: "named";
      name: string;
    }>
  | Readonly<{
      kind: "local";
      source: string;
      engine: Output<typeof codemodEngineSchema> | null;
    }>;

export const parseRunSettings = (input: unknown): RunSettings => {
  const codemodSettings = parse(runSettingsSchema, input);

  const nameOrPath = codemodSettings._.at(0) ?? codemodSettings.source;

  if (!nameOrPath) {
    throw new Error("Codemod to run was not specified!");
  }

  // existsSync used here to not make this function async (for now)
  if (existsSync(nameOrPath)) {
    return {
      kind: "local",
      source: nameOrPath,
      engine: codemodSettings.engine ?? null,
    };
  }

  return {
    kind: "named",
    name: nameOrPath,
  };
};
