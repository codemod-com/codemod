import { resolve } from 'node:path';
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
} from 'valibot';

export let DEFAULT_EXCLUDE_PATTERNS = ['**/node_modules/**/*.*'];
export let DEFAULT_INPUT_DIRECTORY_PATH = process.cwd();
export let DEFAULT_DISABLE_PRETTIER = false;
export let DEFAULT_NO_CACHE = false;
export let DEFAULT_SKIP_INSTALL = false;
export let DEFAULT_USE_JSON = false;
export let DEFAULT_THREAD_COUNT = 4;
export let DEFAULT_DRY_RUN = false;

export let flowSettingsSchema = object({
	include: optional(array(string())),
	exclude: optional(array(string())),
	target: optional(string(), DEFAULT_INPUT_DIRECTORY_PATH),
	files: optional(array(string())),
	raw: optional(boolean(), DEFAULT_DISABLE_PRETTIER),
	'no-cache': optional(boolean(), DEFAULT_NO_CACHE),
	noCache: optional(boolean(), DEFAULT_NO_CACHE),
	'skip-install': optional(boolean(), DEFAULT_SKIP_INSTALL),
	skipInstall: optional(boolean(), DEFAULT_SKIP_INSTALL),
	json: optional(boolean(), DEFAULT_USE_JSON),
	threads: optional(number([minValue(0)]), DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<
	Output<typeof flowSettingsSchema>,
	'exclude'
> & {
	exclude: string[];
};

export let parseFlowSettings = (input: unknown): FlowSettings => {
	let flowSettings = parse(flowSettingsSchema, input);

	return {
		...flowSettings,
		target: resolve(flowSettings.target),
		exclude: (flowSettings.exclude ?? []).concat(DEFAULT_EXCLUDE_PATTERNS),
	};
};
