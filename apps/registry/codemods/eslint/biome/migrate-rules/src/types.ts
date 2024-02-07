import { JSONSchemaForESLintConfigurationFiles } from '../types/eslint.js';

export type RuleValue = 'error' | 'warn' | 'off';

export type Dependencies = Readonly<{
	fetch: typeof fetch;
}>;

export type Options = Readonly<{
	config: JSONSchemaForESLintConfigurationFiles | null;
}>;
