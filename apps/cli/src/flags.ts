import type { Argv } from "yargs";

import {
  DEFAULT_CACHE,
  DEFAULT_DRY_RUN,
  DEFAULT_ENABLE_LOGGING,
  DEFAULT_ENABLE_PRETTIER,
  DEFAULT_INSTALL,
  DEFAULT_TELEMETRY,
  DEFAULT_THREAD_COUNT,
  DEFAULT_USE_JSON,
} from "@codemod-com/runner";

export type GlobalArgvOptions = Awaited<
  ReturnType<ReturnType<typeof buildGlobalOptions>>["argv"]
>;

export type RunArgvOptions = Awaited<
  ReturnType<ReturnType<typeof buildRunOptions>>["argv"]
>;

export const buildGlobalOptions = <T>(y: Argv<T>) =>
  y
    .option("telemetry", {
      type: "boolean",
      default: DEFAULT_TELEMETRY,
      hidden: true,
    })
    .option("no-telemetry", {
      type: "boolean",
      description: "Disable telemetry",
    })
    .option("clientIdentifier", {
      type: "string",
      description: "Telemetry client ID",
      hidden: true,
    })
    .option("version", {
      alias: "v",
      description: "Show version number",
    })
    .option("json", {
      alias: "j",
      type: "boolean",
      description: "Respond with JSON",
      default: DEFAULT_USE_JSON,
    })
    .option("cache", {
      type: "boolean",
      default: DEFAULT_CACHE,
      hidden: true,
    })
    .option("no-cache", {
      type: "boolean",
      description: "Disable cache for HTTP(S) requests",
    });

export const buildRunOptions = <T>(y: Argv<T>) => {
  return y
    .option("include", {
      alias: "i",
      type: "string",
      array: true,
      description: "Glob pattern(s) for files to include",
    })
    .option("exclude", {
      alias: "e",
      type: "string",
      array: true,
      description: "Glob pattern(s) for files to exclude",
      defaultDescription:
        "node_modules, .next, dist, build, *.d.ts, version control folders, gitignore entries",
    })
    .option("target", {
      alias: "t",
      type: "string",
      description: "Input directory path",
    })
    .option("source", {
      alias: "s",
      type: "string",
      description: "Source path of the local codemod to run",
    })
    .option("logs", {
      type: "boolean",
      default: DEFAULT_ENABLE_LOGGING,
      description: "Print codemod execution errors into a logfile",
    })
    .option("format", {
      type: "boolean",
      default: DEFAULT_ENABLE_PRETTIER,
    })
    .option("threads", {
      alias: "n",
      type: "number",
      description: "Number of worker threads",
      default: DEFAULT_THREAD_COUNT,
    })
    .option("dry", {
      alias: "d",
      type: "boolean",
      description: "Perform a dry run",
      default: DEFAULT_DRY_RUN,
    })
    .option("install", {
      type: "boolean",
      default: DEFAULT_INSTALL,
      hidden: true,
    })
    .option("no-install", {
      type: "boolean",
      description:
        "Disable packages installation for the codemod run if there is `deps` field declared in its configuration",
    })
    .option("disable-tree-version-check", {
      type: "boolean",
      description: "Disable the tree version check",
      hidden: true,
    })
    .option("readme", {
      type: "boolean",
      description:
        "Prints description/readme of the codemod if available in the configuration",
    })
    .option("config", {
      type: "boolean",
      description: "Prints configuration file of the codemod",
    })
    .option("version", {
      alias: "v",
      type: "boolean",
      description: "Prints the latest version of the codemod",
    })
    .option("cloud", {
      type: "boolean",
      description: "Run codemod in the cloud",
      default: false,
    });
};
