import { argumentRecordSchema } from '@codemod-com/utilities';
import { cosmiconfig } from 'cosmiconfig';
import {
	type Output,
	array,
	literal,
	object,
	optional,
	parse,
	string,
	union,
} from 'valibot';

let preCommitCodemodSchema = union([
	object({
		source: literal('standalone'),
		path: string(),
		arguments: optional(argumentRecordSchema, {}),
	}),
	object({
		source: literal('package'),
		name: string(),
		arguments: optional(argumentRecordSchema, {}),
	}),
]);

let repositoryConfigurationSchema = object({
	preCommitCodemods: optional(array(preCommitCodemodSchema), []),
});

export type RepositoryConfiguration = Output<
	typeof repositoryConfigurationSchema
>;

export let parseRepositoryConfiguration = (
	i: unknown,
): RepositoryConfiguration => {
	try {
		return parse(repositoryConfigurationSchema, i);
	} catch (error) {
		return {
			preCommitCodemods: [],
		};
	}
};

export let loadRepositoryConfiguration =
	async (): Promise<RepositoryConfiguration> => {
		let publicExplorer = cosmiconfig('codemod');

		let result = await publicExplorer.search();

		return parseRepositoryConfiguration(result?.config);
	};
