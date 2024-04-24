import { sep } from "node:path";
import type { Filemod } from "@codemod-com/filemod";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { type Input, is } from "valibot";
import type { Configuration as BiomeConfig } from "../types/biome.js";
import type { JSONSchemaForESLintConfigurationFiles as EslintConfig } from "../types/eslint.js";
import type { OptionsDefinition as PrettierConfig } from "../types/prettier.js";
import {
	buildFormatterConfig,
	buildLinterConfig,
	clearDependenciesAndAddNotes,
	getPackageManager,
	parseIgnoreEntries,
	replaceKeys,
} from "./functions.js";
import { packageJsonSchema, valibotEslintSchema } from "./schemas.js";
import type { Dependencies, Options } from "./types.js";

export const repomod: Filemod<Dependencies, Options> = {
	includePatterns: [
		"**/package.json",
		"**/{,.}{eslintrc,eslint.config}{,.js,.json,.cjs,.mjs,.yaml,.yml}",
		"**/{,.}{prettierrc,prettier.config}{,.js,.json,.cjs,.mjs,.yaml,.yml}",
		"**/.eslintignore",
		"**/.prettierignore",
	],
	excludePatterns: ["**/node_modules/**"],
	initializeState: async (options) => {
		if (typeof options.input !== "string") {
			return { config: null };
		}

		let eslintConfig: EslintConfig;
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
		const fileName = path.split(sep).at(-1);
		const biomePath = api.joinPaths(api.currentWorkingDirectory, "biome.json");

		if (fileName === "package.json") {
			return [
				// FIRST (!), update biome.json linter.ignore based on eslintIgnore key
				{
					kind: "upsertFile",
					path,
					options: {
						biomeJsonStringContent: await api.readFile(biomePath),
					},
				},
				// Then, update package.json and remove all eslint-related keys
				{
					kind: "upsertFile",
					path,
					options,
				},
			];
		}

		return [
			{
				kind: "upsertFile",
				path,
				options: {
					biomeJsonStringContent: await api.readFile(biomePath),
				},
			},
			{
				kind: "deleteFile",
				path,
			},
		];
	},
	handleData: async (
		api,
		path,
		data,
		options: {
			biomeJsonStringContent?: string;
		},
		state,
	) => {
		const fileName = path.split(sep).at(-1)!;
		const biomePath = api.joinPaths(api.currentWorkingDirectory, "biome.json");

		let biomeJsonContent: BiomeConfig;
		try {
			biomeJsonContent = JSON.parse(options.biomeJsonStringContent!);
		} catch (err) {
			biomeJsonContent = {};
		}

		if (fileName.includes("ignore")) {
			let key: "linter" | "formatter" = "linter";
			if (fileName.includes("prettier")) {
				key = "formatter";
			}

			const filesToIgnore = parseIgnoreEntries(data);
			biomeJsonContent[key] = {
				...biomeJsonContent[key],
				ignore: [...filesToIgnore, ...(biomeJsonContent[key]?.ignore ?? [])],
			};

			return {
				kind: "upsertData",
				data: JSON.stringify(biomeJsonContent),
				path: biomePath,
			};
		}

		if (fileName.includes("eslint")) {
			if (!state?.config?.rules) {
				return { kind: "noop" };
			}

			biomeJsonContent.linter = await buildLinterConfig(
				state.config.rules,
				biomeJsonContent.linter,
				api,
			);

			return {
				kind: "upsertData",
				data: JSON.stringify(biomeJsonContent),
				path: biomePath,
			};
		}

		if (fileName.includes("prettier")) {
			let prettierConfig: PrettierConfig;
			try {
				prettierConfig = JSON.parse(data);
			} catch (err) {
				return { kind: "noop" };
			}

			biomeJsonContent.formatter = buildFormatterConfig(
				prettierConfig,
				biomeJsonContent.formatter,
			);

			return {
				kind: "upsertData",
				data: JSON.stringify(biomeJsonContent),
				path: biomePath,
			};
		}

		if (fileName.includes("package.json")) {
			let packageJson: Input<typeof packageJsonSchema>;
			try {
				const json = JSON.parse(data);
				if (!is(packageJsonSchema, json)) {
					return { kind: "noop" };
				}
				packageJson = json;
			} catch (err) {
				return { kind: "noop" };
			}

			// Means that we want to handle the case with eslintIgnore key in package.json here
			if (isNeitherNullNorUndefined(options.biomeJsonStringContent)) {
				if (
					!packageJson.eslintIgnore ||
					!Array.isArray(packageJson.eslintIgnore)
				) {
					return { kind: "noop" };
				}

				biomeJsonContent.linter = {
					...biomeJsonContent.linter,
					ignore: [
						...packageJson.eslintIgnore,
						...(biomeJsonContent.linter?.ignore ?? []),
					],
				};

				return {
					kind: "upsertData",
					data: JSON.stringify(biomeJsonContent),
					path: biomePath,
				};
			}

			const [, command] = getPackageManager(packageJson);

			packageJson = replaceKeys(packageJson, {
				eslint: `${command} @biomejs/biome lint`,
				"--fix": "--apply",
				prettier: `${command} @biomejs/biome format`,
			});

			packageJson = clearDependenciesAndAddNotes(packageJson);

			return {
				kind: "upsertData",
				data: JSON.stringify(packageJson),
				path,
			};
		}

		return { kind: "noop" };
	},
};
