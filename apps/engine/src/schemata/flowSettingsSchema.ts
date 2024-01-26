import * as S from '@effect/schema/Schema';
import {
	DEFAULT_EXCLUDE_PATTERNS,
	DEFAULT_FILE_LIMIT,
	DEFAULT_INCLUDE_PATTERNS,
	DEFAULT_INPUT_DIRECTORY_PATH,
	DEFAULT_THREAD_COUNT,
	DEFAULT_USE_CACHE,
	DEFAULT_USE_JSON,
	DEFAULT_USE_PRETTIER,
} from '../constants.js';

export const flowSettingsSchema = S.struct({
	include: S.optional(S.array(S.string)).withDefault(
		() => DEFAULT_INCLUDE_PATTERNS,
	),
	exclude: S.optional(S.array(S.string)).withDefault(
		() => DEFAULT_EXCLUDE_PATTERNS,
	),
	target: S.optional(S.string),
	targetPath: S.optional(S.string),
	files: S.optional(S.array(S.string)),
	fileLimit: S.optional(
		S.number.pipe(S.int()).pipe(S.positive()),
	).withDefault(() => DEFAULT_FILE_LIMIT),
	usePrettier: S.optional(S.boolean).withDefault(() => DEFAULT_USE_PRETTIER),
	useCache: S.optional(S.boolean).withDefault(() => DEFAULT_USE_CACHE),
	useJson: S.optional(S.boolean).withDefault(() => DEFAULT_USE_JSON),
	threadCount: S.optional(S.number).withDefault(() => DEFAULT_THREAD_COUNT),
});

export type FlowSettings = Omit<
	S.To<typeof flowSettingsSchema>,
	'target' | 'targetPath'
> & { targetPath: string };

export const parseFlowSettings = (input: unknown): FlowSettings => {
	const flowSettings = S.parseSync(flowSettingsSchema)(input);

	return {
		...flowSettings,
		targetPath:
			flowSettings.targetPath ??
			flowSettings.target ??
			DEFAULT_INPUT_DIRECTORY_PATH,
	};
};
