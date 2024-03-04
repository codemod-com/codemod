import { cosmiconfig } from "cosmiconfig";
import {
	type Output,
	array,
	literal,
	object,
	optional,
	parse,
	string,
	union,
} from "valibot";
import { argumentRecordSchema } from "./schemata/argumentRecordSchema.js";

const preCommitCodemodSchema = union([
	object({
		source: literal("fileSystem"),
		path: string(),
		arguments: optional(argumentRecordSchema, {}),
	}),
	object({
		source: literal("registry"),
		name: string(),
		arguments: optional(argumentRecordSchema, {}),
	}),
]);

const repositoryConfigurationSchema = object({
	schemaVersion: optional(literal("1.0.0"), "1.0.0"),
	preCommitCodemods: optional(array(preCommitCodemodSchema), []),
});

export type RepositoryConfiguration = Output<
	typeof repositoryConfigurationSchema
>;

export const parseRepositoryConfiguration = (
	i: unknown,
): RepositoryConfiguration => {
	try {
		return parse(repositoryConfigurationSchema, i);
	} catch (error) {
		return {
			schemaVersion: "1.0.0",
			preCommitCodemods: [],
		};
	}
};

export const loadRepositoryConfiguration =
	async (): Promise<RepositoryConfiguration> => {
		const publicExplorer = cosmiconfig("codemod");

		const result = await publicExplorer.search();

		return parseRepositoryConfiguration(result?.config);
	};
