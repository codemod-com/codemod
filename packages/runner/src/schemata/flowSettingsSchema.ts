import { resolve } from "node:path";
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

export const DEFAULT_EXCLUDE_PATTERNS = ["**/node_modules/**/*.*"];
export const DEFAULT_INPUT_DIRECTORY_PATH = process.cwd();
export const DEFAULT_DISABLE_PRETTIER = false;
export const DEFAULT_NO_CACHE = false;
export const DEFAULT_SKIP_INSTALL = false;
export const DEFAULT_USE_JSON = false;
export const DEFAULT_THREAD_COUNT = 4;
export const DEFAULT_DRY_RUN = false;

export const flowSettingsSchema = object({
	include: optional(array(string())),
	exclude: optional(array(string())),
	target: optional(string(), DEFAULT_INPUT_DIRECTORY_PATH),
	files: optional(array(string())),
	raw: optional(boolean(), DEFAULT_DISABLE_PRETTIER),
	"no-cache": optional(boolean(), DEFAULT_NO_CACHE),
	noCache: optional(boolean(), DEFAULT_NO_CACHE),
	"skip-install": optional(boolean(), DEFAULT_SKIP_INSTALL),
	skipInstall: optional(boolean(), DEFAULT_SKIP_INSTALL),
	json: optional(boolean(), DEFAULT_USE_JSON),
	threads: optional(number([minValue(0)]), DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<
	Output<typeof flowSettingsSchema>,
	"exclude"
> & {
	exclude: string[];
};

export const parseFlowSettings = (input: unknown): FlowSettings => {
	const flowSettings = parse(flowSettingsSchema, input);

	return {
		...flowSettings,
		target: resolve(flowSettings.target),
		exclude: (flowSettings.exclude ?? []).concat(DEFAULT_EXCLUDE_PATTERNS),
	};
};
