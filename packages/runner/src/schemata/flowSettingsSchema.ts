import { resolve } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import {
  type Output,
  array,
  boolean,
  minValue,
  number,
  object,
  optional,
  parse,
  string,
} from "valibot";

export const DEFAULT_EXCLUDE_PATTERNS = [
  "*.d.ts",
  "node_modules/",
  ".next/",
  "dist/",
  "build/",
  // version control systems
  ".git/",
  ".svn/",
  ".hg/",
  ".bzr/",
  "_darcs/",
  "_MTN/",
  "_FOSSIL_",
  ".fslckout",
  ".view/",
];
export const DEFAULT_INPUT_DIRECTORY_PATH = process.cwd();
export const DEFAULT_ENABLE_PRETTIER = true;
export const DEFAULT_CACHE = true;
export const DEFAULT_INSTALL = true;
export const DEFAULT_USE_JSON = false;
export const DEFAULT_THREAD_COUNT = 4;
export const DEFAULT_DRY_RUN = false;
export const DEFAULT_TELEMETRY = true;

export const flowSettingsSchema = object({
  _: array(string()),
  include: optional(array(string())),
  exclude: optional(array(string())),
  target: optional(string()),
  files: optional(array(string())),
  format: optional(boolean(), DEFAULT_ENABLE_PRETTIER),
  cache: optional(boolean(), DEFAULT_CACHE),
  install: optional(boolean(), DEFAULT_INSTALL),
  json: optional(boolean(), DEFAULT_USE_JSON),
  threads: optional(number([minValue(0)]), DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<
  Output<typeof flowSettingsSchema>,
  "exclude" | "target"
> & {
  target: string;
  exclude: string[];
};

export const parseFlowSettings = (
  input: unknown,
  printer: PrinterBlueprint,
): FlowSettings => {
  const flowSettings = parse(flowSettingsSchema, input);

  const positionalPassedTarget = flowSettings._.at(1);
  const argTarget = flowSettings.target;

  let target: string;
  if (positionalPassedTarget && argTarget) {
    printer.printConsoleMessage(
      "info",
      chalk.yellow(
        "Both positional and argument target options are passed. Defaulting to the argument target option...",
      ),
    );

    target = argTarget;
  } else {
    target =
      positionalPassedTarget ?? argTarget ?? DEFAULT_INPUT_DIRECTORY_PATH;
  }

  return {
    ...flowSettings,
    target: resolve(target),
    exclude: (flowSettings.exclude ?? []).concat(DEFAULT_EXCLUDE_PATTERNS),
  };
};
