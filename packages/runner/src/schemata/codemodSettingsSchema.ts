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

let codemodEngineSchema = union([
	literal('jscodeshift'),
	literal('filemod'),
	literal('ts-morph'),
	literal('ast-grep'),
]);

export let codemodSettingsSchema = object({
	_: array(string()),
	source: optional(string()),
	codemodEngine: optional(codemodEngineSchema),
});

export type CodemodSettings =
	| Readonly<{
			kind: 'runOnPreCommit';
	  }>
	| Readonly<{
			kind: 'runNamed';
			name: string;
	  }>
	| Readonly<{
			kind: 'runSourced';
			source: string;
			codemodEngine: Output<typeof codemodEngineSchema> | null;
	  }>;

export let parseCodemodSettings = (input: unknown): CodemodSettings => {
	let codemodSettings = parse(codemodSettingsSchema, input);

	if (codemodSettings._.includes('runOnPreCommit')) {
		return {
			kind: 'runOnPreCommit',
		};
	}

	let source = codemodSettings.source;

	if (source) {
		return {
			kind: 'runSourced',
			source,
			codemodEngine: codemodSettings.codemodEngine ?? null,
		};
	}

	let codemodName = codemodSettings._.at(-1);

	if (!codemodName) {
		throw new Error('Codemod to run was not specified!');
	}

	return {
		kind: 'runNamed',
		name: codemodName,
	};
};
