import type { Filemod } from '@codemod-com/filemod';
import { is, object, record, string } from 'valibot';
import { Configuration } from '../types/biome.js';
import { JSONSchemaForESLintConfigurationFiles } from '../types/eslint.js';

const valibotEslintSchema = object({
	rules: record(string()),
});

export const repomod: Filemod<
	Record<string, never>,
	{ config: JSONSchemaForESLintConfigurationFiles | null }
> = {
	includePatterns: [
		// "**/biome.json",
		'**/package.json',
		'**/{,.}{eslintrc,eslint.config}{,.js,.json,.cjs,.mjs,.yaml,.yml}',
		'**/{,.}{prettierrc,prettier.config}{,.js,.json,.cjs,.mjs,.yaml,.yml}',
	],
	excludePatterns: ['**/node_modules/**'],
	initializeState: async (options) => {
		if (typeof options.input !== 'string') {
			return { config: null };
		}

		let eslintConfig: JSONSchemaForESLintConfigurationFiles;
		try {
			const json = JSON.parse(options.input);
			if (!is(valibotEslintSchema, json)) {
				return { config: null };
			}
			eslintConfig = json;
		} catch (err) {
			return { config: null };
		}

		return { config: eslintConfig };
	},
	handleFile: async (api, path, options) => {
		if (path.endsWith('package.json')) {
			return [{ kind: 'upsertFile', path, options }];
		}

		if (path.includes('eslint') || path.includes('prettier')) {
			return [
				{ kind: 'deleteFile', path },
				{ kind: 'upsertFile', path: 'biome.json', options },
			];
		}

		return [];
	},
	handleData: async (_, path, data, _options, state) => {
		let biomeJson: Configuration;
		// try {
		// 	const json = JSON.parse();
		// 	if (!is(valibotEslintSchema, json)) {
		// 		return { config: null };
		// 	}
		// 	eslintConfig = json;
		// } catch (err) {
		// 	return { config: null };
		// }

		if (path.includes('biome')) {
			return { kind: 'upsertData', data: 'abcd', path };
		}

		// if (path.includes('eslint')) {
		// 	if (!state?.config?.rules) {
		// 		return { kind: 'noop' };
		// 	}

		// 	return {
		// 		kind: 'upsertData',
		// 		path,
		// 		data: expressions.join('\n'),
		// 	};
		// }

		return { kind: 'noop' };
	},
	handleFinish: async (options, state) => {
		return { kind: 'noop' };
	},
};
