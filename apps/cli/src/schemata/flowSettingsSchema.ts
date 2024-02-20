import * as S from '@effect/schema/Schema';
import {
	DEFAULT_DISABLE_PRETTIER,
	DEFAULT_EXCLUDE_PATTERNS,
	DEFAULT_FILE_LIMIT,
	DEFAULT_INCLUDE_PATTERNS,
	DEFAULT_INPUT_DIRECTORY_PATH,
	DEFAULT_NO_CACHE,
	DEFAULT_THREAD_COUNT,
	DEFAULT_USE_JSON,
} from '../constants.js';

export const flowSettingsSchema = S.struct({
	include: S.optional(S.array(S.string)).withDefault(
		() => DEFAULT_INCLUDE_PATTERNS,
	),
	exclude: S.optional(S.array(S.string)).withDefault(
		() => DEFAULT_EXCLUDE_PATTERNS,
	),
	target: S.optional(S.string),
	files: S.optional(S.array(S.string)),
	limit: S.optional(S.number.pipe(S.int()).pipe(S.positive())).withDefault(
		() => DEFAULT_FILE_LIMIT,
	),
	raw: S.optional(S.boolean).withDefault(() => DEFAULT_DISABLE_PRETTIER),
	'no-cache': S.optional(S.boolean).withDefault(() => DEFAULT_NO_CACHE),
	noCache: S.optional(S.boolean).withDefault(() => DEFAULT_NO_CACHE),
	json: S.optional(S.boolean).withDefault(() => DEFAULT_USE_JSON),
	threads: S.optional(S.number).withDefault(() => DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<S.To<typeof flowSettingsSchema>, 'target'> & {
	target: string;
};

export const parseFlowSettings = (input: unknown): FlowSettings => {
	const flowSettings = S.parseSync(flowSettingsSchema)(input);

	return {
		...flowSettings,
		target: flowSettings.target ?? DEFAULT_INPUT_DIRECTORY_PATH,
	};
};
