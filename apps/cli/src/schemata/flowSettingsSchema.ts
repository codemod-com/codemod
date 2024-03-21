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
import {
	DEFAULT_DISABLE_PRETTIER,
	DEFAULT_EXCLUDE_PATTERNS,
	DEFAULT_INPUT_DIRECTORY_PATH,
	DEFAULT_NO_CACHE,
	DEFAULT_NO_INSTALL,
	DEFAULT_THREAD_COUNT,
	DEFAULT_USE_JSON,
} from "../constants.js";

export const flowSettingsSchema = object({
	include: optional(array(string())),
	exclude: optional(array(string()), DEFAULT_EXCLUDE_PATTERNS),
	target: optional(string(), DEFAULT_INPUT_DIRECTORY_PATH),
	files: optional(array(string())),
	raw: optional(boolean(), DEFAULT_DISABLE_PRETTIER),
	"no-cache": optional(boolean(), DEFAULT_NO_CACHE),
	noCache: optional(boolean(), DEFAULT_NO_CACHE),
	"no-install": optional(boolean(), DEFAULT_NO_INSTALL),
	noInstall: optional(boolean(), DEFAULT_NO_INSTALL),
	json: optional(boolean(), DEFAULT_USE_JSON),
	threads: optional(number([minValue(0)]), DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Output<typeof flowSettingsSchema>;

export const parseFlowSettings = (input: unknown): FlowSettings => {
	const flowSettings = parse(flowSettingsSchema, input);

	flowSettings.target = resolve(flowSettings.target);

	return flowSettings;
};
