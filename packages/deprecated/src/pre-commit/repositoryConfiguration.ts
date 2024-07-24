import { argumentRecordSchema } from "@codemod-com/utilities";
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

const preCommitCodemodSchema = union([
  object({
    source: literal("standalone"),
    path: string(),
    arguments: optional(argumentRecordSchema, {}),
  }),
  object({
    source: literal("package"),
    name: string(),
    arguments: optional(argumentRecordSchema, {}),
  }),
]);

const repositoryConfigurationSchema = object({
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
