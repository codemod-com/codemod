import {
	type Output,
	array,
	boolean,
	integer,
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
	DEFAULT_INCLUDE_PATTERNS,
	DEFAULT_INPUT_DIRECTORY_PATH,
	DEFAULT_NO_CACHE,
	DEFAULT_THREAD_COUNT,
	DEFAULT_USE_JSON,
} from "../constants.js";

export const flowSettingsSchema = object({
	include: optional(array(string()), DEFAULT_INCLUDE_PATTERNS),
	exclude: optional(array(string()), DEFAULT_EXCLUDE_PATTERNS),
	target: optional(string()),
	files: optional(array(string())),
	raw: optional(boolean(), DEFAULT_DISABLE_PRETTIER),
	"no-cache": optional(boolean(), DEFAULT_NO_CACHE),
	noCache: optional(boolean(), DEFAULT_NO_CACHE),
	json: optional(boolean(), DEFAULT_USE_JSON),
	threads: optional(number([minValue(0)]), DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<Output<typeof flowSettingsSchema>, "target"> & {
	target: string;
};

export const parseFlowSettings = (input: unknown): FlowSettings => {
	const flowSettings = parse(flowSettingsSchema, input);

	return {
		...flowSettings,
		target: flowSettings.target ?? DEFAULT_INPUT_DIRECTORY_PATH,
	};
};
