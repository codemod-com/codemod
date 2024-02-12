import * as S from '@effect/schema/Schema';
import { argumentsSchema } from './argumentsSchema.js';

const optionalArgumentsSchema = S.optional(argumentsSchema).withDefault(
	() => [],
);

const PIRANHA_LANGUAGES = [
	'java',
	'kt',
	'go',
	'py',
	'swift',
	'ts',
	'tsx',
	'scala',
] as const;

const piranhaLanguageSchema = S.union(
	...PIRANHA_LANGUAGES.map((language) => S.literal(language)),
);

export const codemodConfigSchema = S.union(
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('piranha'),
		language: piranhaLanguageSchema,
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('jscodeshift'),
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('ts-morph'),
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.union(S.literal('repomod-engine'), S.literal('filemod')),
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('recipe'),
		names: S.array(S.string),
		arguments: optionalArgumentsSchema,
	}),
);
