import type { Filemod } from '@codemod-com/filemod';
import { any, Input, is, object, optional, record, string } from 'valibot';
import { Configuration } from '../types/biome.js';
import { JSONSchemaForESLintConfigurationFiles } from '../types/eslint.js';

const valibotEslintSchema = object({
	rules: record(string()),
});

const packageJsonSchema = object({
	name: optional(string()),
	dependencies: optional(record(string())),
	devDependencies: optional(record(string())),
	scripts: optional(record(string())),
	eslintConfig: optional(any()),
	eslintIgnore: optional(any()),
	packageManager: optional(string()),
});

function replaceKeys(
	obj: Record<string, unknown>,
	pattern: RegExp,
	replacement: string,
) {
	// Check if the input is an object
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	// Iterate through each key in the object
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			// If the value of the key is an object, recursively call the function
			if (typeof obj[key] === 'object' && obj[key] !== null) {
				obj[key] = replaceKeys(
					obj[key] as Record<string, unknown>,
					pattern,
					replacement,
				);
			} else {
				// If the value is not an object, check for the pattern in the string
				if (
					typeof obj[key] === 'string' &&
					pattern.test(obj[key] as string)
				) {
					// Replace the key with the specified replacement
					obj[key] = (obj[key] as string).replace(
						pattern,
						replacement,
					);
				}
			}
		}
	}

	return obj;
}

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
		const fileName = path.split('/').at(-1);
		if (fileName === 'package.json') {
			return [{ kind: 'upsertFile', path, options }];
		}

		if (fileName?.includes('eslint') || fileName?.includes('prettier')) {
			return [
				// { kind: 'deleteFile', path },
				{
					kind: 'upsertFile',
					path,
					options: {
						biomeJsonStringContent:
							await api.readFile('biome.json'),
					},
				},
			];
		}

		return [];
	},
	handleData: async (
		_,
		path,
		data,
		options: { biomeJsonStringContent?: string },
		state,
	) => {
		if (path.split('/').at(-1)?.includes('eslint')) {
			const markDownUrl =
				'https://raw.githubusercontent.com/biomejs/biome/main/website/src/content/docs/linter/rules-sources.mdx';
			const biomeRules = await fetch(markDownUrl)
				.then((res) => res.text())
				.then((text) => text.split('\n').slice(5));

			if (!state?.config?.rules) {
				return { kind: 'noop' };
			}

			let biomeJsonContent: Configuration;
			try {
				biomeJsonContent = JSON.parse(options.biomeJsonStringContent!);
			} catch (err) {
				biomeJsonContent = {};
			}

			for (const [name, value] of Object.entries(state.config.rules)) {
				if (value === 'off' || value === 0) {
					continue;
				}

				const ruleIndex = biomeRules.findIndex((rule) =>
					rule.includes(`[${name}]`),
				);
				let headerName: string | undefined;
				for (let i = ruleIndex; i >= 0; i--) {
					const item = biomeRules[i];

					if (item?.startsWith('#')) {
						headerName = item;
						break;
					}
				}

				// Shouldn't happen
				if (!headerName) {
					throw new Error('Oops, header not found');
				}

				const [rule, link] =
					biomeRules[ruleIndex]?.match(/\[(.*?)\]/g) ?? [];

				const biomePageContent = await fetch(
					`https://biomejs.dev/${link}`,
				).then((res) => res.text());

				console.log(biomePageContent);

				biomeJsonContent.linter = {
					...(biomeJsonContent.linter ?? {}),
					rules: {
						...biomeJsonContent.linter?.rules,
						// [name]: {
						// 	value,
						// 	source: headerName,
						// 	description: rule,
						// },
					},
				};
			}

			// Find corresponding rules based on the state passed and infer other stuff from eslint config
			return { kind: 'noop' };
			// return { kind: 'upsertData', data: '?', path: 'biome.json' };
		}

		if (path.split('/').at(-1)?.includes('prettier')) {
			// Infer config from prettier and consider plugins
			return { kind: 'noop' };
			// return { kind: 'upsertData', data: '?', path: 'biome.json' };
		}

		if (path.split('/').at(-1)?.includes('package.json')) {
			let packageJson: Input<typeof packageJsonSchema>;
			try {
				const json = JSON.parse(data);
				if (!is(packageJsonSchema, json)) {
					return { kind: 'noop' };
				}
				packageJson = json;
			} catch (err) {
				return { kind: 'noop' };
			}

			// Remove possible eslint keys
			if (packageJson.eslintConfig) {
				delete packageJson.eslintConfig;
			}
			if (packageJson.eslintIgnore) {
				delete packageJson.eslintIgnore;
			}

			let eslintDepExisted = false;
			// Remove mocha and other mocha-compatibles from dependencies & devDependencies, add vitest devDep
			if (packageJson.dependencies) {
				Object.keys(packageJson.dependencies).forEach((dep) => {
					if (dep.includes('eslint')) {
						eslintDepExisted = true;
						delete packageJson.dependencies![dep];
					}
				});
			}

			if (packageJson.devDependencies) {
				Object.keys(packageJson.devDependencies).forEach((dep) => {
					if (dep.includes('eslint')) {
						eslintDepExisted = true;
						delete packageJson.devDependencies![dep];
					}
				});
			}

			const packageManager = packageJson.packageManager?.split('@').at(0);
			const isYarn = (
				packageManager ?? JSON.stringify(packageJson.scripts)
			).match(/yarn/g);
			const isPnpm = (
				packageManager ?? JSON.stringify(packageJson.scripts)
			).match(/pnpm/g);
			const isBun = (
				packageManager ?? JSON.stringify(packageJson.scripts)
			).match(/bun/g);
			const command = isYarn
				? 'yarn dlx'
				: isPnpm
				  ? 'pnpm dlx'
				  : isBun
				    ? 'bunx'
				    : 'npx';

			replaceKeys(
				packageJson,
				/eslint --fix/g,
				`${command} @biomejs/biome lint --apply`,
			);
			replaceKeys(
				packageJson,
				/prettier --write/g,
				`${command} @biomejs/biome format --write`,
			);

			if (!packageJson.scripts) {
				packageJson.scripts = {};
			}
			packageJson.scripts.NOTE =
				'You can apply both linter, formatter and import ordering by using https://biomejs.dev/reference/cli/#biome-check';

			if (eslintDepExisted) {
				packageJson.devDependencies = {
					...packageJson.devDependencies,
					'@biomejs/biome': '1.5.3',
				};
			}

			return { kind: 'noop' };
			// return {
			// 	kind: 'upsertData',
			// 	data: JSON.stringify(packageJson),
			// 	path,
			// };
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
