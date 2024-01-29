import { cosmiconfig } from 'cosmiconfig';
import * as S from '@effect/schema/Schema';
import { argumentRecordSchema } from './schemata/argumentRecordSchema.js';

const preCommitCodemodSchema = S.union(
	S.struct({
		source: S.literal('fileSystem'),
		path: S.string,
		arguments: S.optional(argumentRecordSchema).withDefault(() => ({})),
	}),
	S.struct({
		source: S.literal('registry'),
		name: S.string,
		arguments: S.optional(argumentRecordSchema).withDefault(() => ({})),
	}),
);

const repositoryConfigurationSchema = S.struct({
	schemaVersion: S.optional(S.literal('1.0.0')).withDefault(() => '1.0.0'),
	preCommitCodemods: S.optional(S.array(preCommitCodemodSchema)).withDefault(
		() => [],
	),
});

export type RepositoryConfiguration = S.To<
	typeof repositoryConfigurationSchema
>;

export const parseRepositoryConfiguration = (
	i: unknown,
): RepositoryConfiguration => {
	try {
		return S.parseSync(repositoryConfigurationSchema)(i);
	} catch (error) {
		return {
			schemaVersion: '1.0.0',
			preCommitCodemods: [],
		};
	}
};

export const loadRepositoryConfiguration =
	async (): Promise<RepositoryConfiguration> => {
		const publicExplorer = cosmiconfig('intuita');

		const result = await publicExplorer.search();

		return parseRepositoryConfiguration(result?.config);
	};
