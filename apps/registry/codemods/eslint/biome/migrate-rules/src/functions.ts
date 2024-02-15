import type { DataAPI } from '@codemod-com/filemod';
import { isNeitherNullNorUndefined } from '@codemod-com/utilities/functions/validationMethods';
import type { Input } from 'valibot';
import type {
	Configuration as BiomeConfig,
	Rules as BiomeLinterRules,
} from '../types/biome.js';
import type { OptionsDefinition as PrettierConfig } from '../types/prettier.js';
import type { packageJsonSchema } from './schemas.js';
import type { Dependencies, RuleValue } from './types.js';

function deepCopy<T>(obj: T): T {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	const newObj = (Array.isArray(obj) ? [] : {}) as T;

	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			newObj[key] = deepCopy(obj[key]);
		}
	}

	return newObj as T;
}

export function replaceKeys(
	obj: Record<string, unknown>,
	replacements: Record<string, string>,
): Record<string, unknown> {
	// Just in case
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	const newObj = deepCopy(obj);

	for (const [pattern, replacement] of Object.entries(replacements)) {
		// Iterate through each key in the object
		for (const key in newObj) {
			if (newObj.hasOwnProperty(key)) {
				// If the value of the key is an object, recursively call the function
				if (typeof newObj[key] === 'object' && newObj[key] !== null) {
					// We don't want to modify anything that is not under scripts or lint-staged keys for now
					// as these are the main places where eslint and prettier commands are used most of the time.
					if (!['scripts', 'lint-staged'].includes(key)) {
						continue;
					}
					newObj[key] = replaceKeys(
						newObj[key] as Record<string, unknown>,
						replacements,
					);
				} else {
					// If the value is not an object, check for the pattern in the string
					if (
						typeof newObj[key] === 'string' &&
						(newObj[key] as string).includes(pattern)
					) {
						// Replace the key with the specified replacement
						newObj[key] = (newObj[key] as string).replace(
							pattern,
							replacement,
						);
					}
				}
			}
		}
	}

	return newObj;
}

export function parseIgnoreEntries(content: string): string[] {
	return content
		.split('\n')
		.map((l) => l.trim())
		.filter((v) => !v.startsWith('#') && v.length > 0);
}

function isRuleValue(value: string): value is RuleValue {
	return ['error', 'warn', 'off'].includes(value);
}
export function eslintToBiomeRuleValue(value: string): RuleValue {
	if (isRuleValue(value)) {
		return value;
	}

	if (value === '0') {
		return 'off';
	}

	if (value === '1') {
		return 'warn';
	}

	return 'error';
}

export function getPackageManager(
	packageJson: Input<typeof packageJsonSchema>,
) {
	const isYarn = (
		packageJson.packageManager ?? JSON.stringify(packageJson.scripts)
	).match(/yarn/g);
	if (isYarn) {
		return ['yarn', 'yarn dlx'] as const;
	}

	const isPnpm = (
		packageJson.packageManager ?? JSON.stringify(packageJson.scripts)
	).match(/pnpm/g);
	if (isPnpm) {
		return ['pnpm', 'pnpm dlx'] as const;
	}

	const isBun = (
		packageJson.packageManager ?? JSON.stringify(packageJson.scripts)
	).match(/bun/g);
	if (isBun) {
		return ['bun', 'bunx'] as const;
	}

	return ['npm', 'npx'] as const;
}

export function clearDependenciesAndAddNotes(
	packageJson: Input<typeof packageJsonSchema>,
): Input<typeof packageJsonSchema> {
	const newObj = deepCopy(packageJson);

	if (newObj.eslintConfig) {
		delete newObj.eslintConfig;
	}

	if (newObj.eslintIgnore) {
		delete newObj.eslintIgnore;
	}

	let depExisted = false;
	let tailwindPluginExisted = false;

	if (newObj.dependencies) {
		Object.keys(newObj.dependencies).forEach((dep) => {
			if (dep.includes('eslint') || dep.includes('prettier')) {
				if (dep.includes('tailwindcss')) {
					tailwindPluginExisted = true;
				}
				depExisted = true;
				delete newObj.dependencies![dep];
			}
		});
	}

	if (newObj.devDependencies) {
		Object.keys(newObj.devDependencies).forEach((dep) => {
			if (dep.includes('eslint') || dep.includes('prettier')) {
				if (dep.includes('tailwindcss')) {
					tailwindPluginExisted = true;
				}
				depExisted = true;
				delete newObj.devDependencies![dep];
			}
		});
	}

	if (depExisted) {
		newObj.devDependencies = {
			...newObj.devDependencies,
			'@biomejs/biome': '1.5.3',
		};

		if (!packageJson.scripts) {
			packageJson.scripts = {};
		}

		packageJson.scripts.NOTE =
			'You can apply both linter, formatter and import ordering by using https://biomejs.dev/reference/cli/#biome-check';

		if (tailwindPluginExisted) {
			packageJson.scripts.NOTE2 =
				'There is an ongoing work to release prettier-tailwind-plugin alternative: https://biomejs.dev/linter/rules/use-sorted-classes/, https://github.com/biomejs/biome/issues/1274';
		}
	}

	return newObj;
}

export function buildFormatterConfig(
	prettierConfig: PrettierConfig,
	existingFormatterConfig: BiomeConfig['formatter'],
): BiomeConfig['formatter'] {
	return {
		...existingFormatterConfig,
		...(prettierConfig.useTabs && {
			indentStyle: prettierConfig.useTabs ? 'tab' : 'space',
		}),
		...(prettierConfig.tabWidth && {
			indentWidth: prettierConfig.tabWidth,
		}),
		...(prettierConfig.endOfLine && {
			lineEnding:
				prettierConfig.endOfLine === 'auto'
					? 'lf'
					: prettierConfig.endOfLine,
		}),
		...(prettierConfig.printWidth && {
			lineWidth: prettierConfig.printWidth,
		}),
	};
}

export async function buildLinterConfig(
	rules: Record<string, unknown>,
	existingLinterConfig: BiomeConfig['linter'],
	api: DataAPI<Dependencies>,
): Promise<BiomeConfig['linter']> {
	const { fetch } = api.getDependencies();

	// Find corresponding rules based on the state passed and infer other stuff from eslint config
	const markDownUrl =
		'https://raw.githubusercontent.com/biomejs/biome/main/website/src/content/docs/linter/rules-sources.mdx';
	const biomeRules = await fetch(markDownUrl)
		.then((res) => res.text())
		.then((text) => text.split('\n').slice(5));

	const newObj = existingLinterConfig ? deepCopy(existingLinterConfig) : {};

	for (const [name, value] of Object.entries(rules)) {
		const ruleValue =
			(Array.isArray(value) ? value.at(0) : value) ?? 'error';
		const ruleName = name.split('/').at(-1);
		if (!ruleName) {
			continue;
		}

		const ruleIndex = biomeRules.findIndex((rule) =>
			rule.includes(`[${ruleName}]`),
		);
		if (ruleIndex === -1) {
			continue;
		}

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

		const urlFragment = [
			...(biomeRules[ruleIndex]?.matchAll(/\((.*?)\)/g) ?? []),
		]
			.at(1)
			?.at(1);

		const biomePageContent = await fetch(
			`https://biomejs.dev/${urlFragment}`,
		).then((res) => res.text());

		const [, biomeRuleGroup, biomeRuleName] =
			biomePageContent.match(/lint\/(\w+)\/(\w+)/) ?? [];

		if (!biomeRuleGroup || !biomeRuleName) {
			continue;
		}

		// If key is already present
		if (
			isNeitherNullNorUndefined(
				// @ts-expect-error avoid as keyof casts
				newObj.rules?.[biomeRuleGroup]?.[biomeRuleName],
			)
		) {
			continue;
		}

		const biomeRuleValue: 'error' | 'warn' | 'off' =
			eslintToBiomeRuleValue(ruleValue);

		const existingRuleGroupDef =
			newObj.rules?.[biomeRuleGroup as keyof BiomeLinterRules] ?? {};

		// 'all', 'off', etc. we don't want to override these
		if (typeof existingRuleGroupDef !== 'object') {
			continue;
		}

		newObj.rules = {
			...newObj?.rules,
			[biomeRuleGroup]: {
				...existingRuleGroupDef,
				[biomeRuleName]: biomeRuleValue,
			},
		};
	}

	return newObj;
}
