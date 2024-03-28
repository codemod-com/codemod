import { Argv } from "yargs";
import {
	DEFAULT_DISABLE_PRETTIER,
	DEFAULT_DRY_RUN,
	DEFAULT_EXCLUDE_PATTERNS,
	DEFAULT_NO_CACHE,
	DEFAULT_SKIP_INSTALL,
	DEFAULT_THREAD_COUNT,
	DEFAULT_USE_JSON,
} from "./constants.js";

export const buildUseJsonOption = <T extends Record<string, unknown>>(
	y: Argv<T>,
) =>
	y.option("json", {
		alias: "j",
		type: "boolean",
		description: "Respond with JSON",
		default: DEFAULT_USE_JSON,
	});

export const buildUseCacheOption = <T extends Record<string, unknown>>(
	y: Argv<T>,
) =>
	y.option("no-cache", {
		type: "boolean",
		description: "Disable cache for HTTP(S) requests",
		default: DEFAULT_NO_CACHE,
	});

export const buildOptions = <T extends Record<string, unknown>>(y: Argv<T>) => {
	return buildUseCacheOption(
		buildUseJsonOption(
			y
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
					default: DEFAULT_EXCLUDE_PATTERNS,
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
				.option("engine", {
					type: "string",
					description:
						'The engine to use with the local codemod: "jscodeshift", "ts-morph", "filemod", "ast-grep"',
				})
				.option("raw", {
					alias: "r",
					type: "boolean",
					description: "Disable formatting output with Prettier",
					default: DEFAULT_DISABLE_PRETTIER,
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
				.option("telemetryDisable", {
					type: "boolean",
					description: "Disable telemetry",
				})
				.option("skip-install", {
					type: "boolean",
					description:
						"Disable packages installation for the codemod run if there is `deps` field declared in its configuration.",
					default: DEFAULT_SKIP_INSTALL,
				}),
		),
	);
};
