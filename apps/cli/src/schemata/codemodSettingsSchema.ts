import * as S from '@effect/schema/Schema';

const codemodEngineSchema = S.union(
	S.literal('jscodeshift'),
	S.literal('repomod-engine'),
	S.literal('filemod'),
	S.literal('ts-morph'),
);

export const codemodSettingsSchema = S.union(
	S.struct({
		_: S.array(S.string),
		source: S.optional(S.string),
		sourcePath: S.optional(S.string),
		codemodEngine: S.optional(codemodEngineSchema),
	}),
);

export type CodemodSettings =
	| Readonly<{
			kind: 'runOnPreCommit';
	  }>
	| Readonly<{
			kind: 'runNamed';
			name: string;
	  }>
	| Readonly<{
			kind: 'runSourced';
			sourcePath: string;
			codemodEngine: S.To<typeof codemodEngineSchema> | null;
	  }>;

export const parseCodemodSettings = (input: unknown): CodemodSettings => {
	const codemodSettings = S.parseSync(codemodSettingsSchema)(input);

	if (codemodSettings._.includes('runOnPreCommit')) {
		return {
			kind: 'runOnPreCommit',
		};
	}

	const sourcePath =
		'source' in codemodSettings
			? codemodSettings.source
			: codemodSettings.sourcePath;

	if (sourcePath) {
		return {
			kind: 'runSourced',
			sourcePath,
			codemodEngine: codemodSettings.codemodEngine ?? null,
		};
	}

	const codemodName = codemodSettings._.at(-1);

	if (!codemodName) {
		throw new Error('Codemod to run was not specified!');
	}

	return {
		kind: 'runNamed',
		name: codemodName,
	};
};
