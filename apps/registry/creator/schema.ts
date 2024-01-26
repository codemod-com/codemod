import * as S from '@effect/schema/Schema';

const argvSchema = S.struct({
	name: S.string,
	engine: S.union(
		S.literal('piranha'),
		S.literal('jscodeshift'),
		S.literal('ts-morph'),
		S.literal('filemod'),
		S.literal('recipe'),
	),
});

export type ArgvSchema = S.Schema.To<typeof argvSchema>;

export const parseArgv = S.parseSync(argvSchema);

const pnpmWorkspaceSchema = S.struct({
	packages: S.array(S.string),
});

export type PnpmWorkspace = S.Schema.To<typeof pnpmWorkspaceSchema>;

export const parsePnpmWorkspaceSchema = S.parseSync(pnpmWorkspaceSchema);
