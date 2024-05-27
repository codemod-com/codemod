import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { glob } from "fast-glob";
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
  "**/node_modules/**/*.*",
  "**/.next/**/*.*",
  "**/dist/**/*.*",
  "**/build/**/*.*",
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

export const parseFlowSettings = async (
  input: unknown,
  printer: PrinterBlueprint,
): Promise<FlowSettings> => {
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

  const targetAbs = resolve(target);

  const gitIgnorePaths = await glob("**/.gitignore", {
    cwd: targetAbs,
    absolute: true,
  });

  let gitIgnored: string[] = [];
  if (gitIgnorePaths.length > 0) {
    printer.printConsoleMessage(
      "info",
      chalk.cyan(
        "Found .gitignore file(s) in the target directory:",
        `\n- ${gitIgnorePaths.join("\n- ")}`,
        "Adding the ignored paths to the exclude list...",
      ),
    );

    for (const gitIgnorePath of gitIgnorePaths) {
      const gitIgnoreContents = await readFile(gitIgnorePath, "utf-8");
      gitIgnored = gitIgnored.concat(
        gitIgnoreContents
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !line.startsWith("#")),
      );
    }
  }

  return {
    ...flowSettings,
    target: targetAbs,
    exclude: (flowSettings.exclude ?? [])
      .concat(DEFAULT_EXCLUDE_PATTERNS)
      .concat(gitIgnored),
  };
};
