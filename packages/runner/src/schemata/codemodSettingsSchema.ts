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

export const codemodSettingsSchema = object({
  _: array(string()),
  source: optional(string()),
  engine: optional(codemodEngineSchema),
});

export type CodemodSettings =
  | Readonly<{
      kind: "runOnPreCommit";
    }>
  | Readonly<{
      kind: "runNamed";
      name: string;
    }>
  | Readonly<{
      kind: "runSourced";
      source: string;
      engine: Output<typeof codemodEngineSchema> | null;
    }>;

export const parseCodemodSettings = (input: unknown): CodemodSettings => {
  const codemodSettings = parse(codemodSettingsSchema, input);

  if (codemodSettings._.includes("runOnPreCommit")) {
    return {
      kind: "runOnPreCommit",
    };
  }

  const nameOrPath = codemodSettings._.at(0);

  if (!nameOrPath) {
    throw new Error("Codemod to run was not specified!");
  }

  if (existsSync(nameOrPath) || codemodSettings.source) {
    return {
      kind: "runSourced",
      source: codemodSettings.source ?? nameOrPath,
      engine: codemodSettings.engine ?? null,
    };
  }

  return {
    kind: "runNamed",
    name: nameOrPath,
  };
};
