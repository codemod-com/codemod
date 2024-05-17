import { any, object, optional, record, string, tuple } from 'valibot';

export let valibotEslintSchema = object({
	rules: record(tuple([string()])),
});

export let packageJsonSchema = object({
	name: optional(string()),
	dependencies: optional(record(string())),
	devDependencies: optional(record(string())),
	scripts: optional(record(string())),
	eslintConfig: optional(any()),
	eslintIgnore: optional(any()),
	packageManager: optional(string()),
});
