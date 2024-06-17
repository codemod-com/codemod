import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type CallExpression, IndentationText, Project } from 'ts-morph';
import { describe, it } from 'vitest';
import { handleSourceFile } from '../src/index.js';
import type { Options, VariableType, VariableValue } from '../src/types.js';
import { buildLiteral, getCEExpressionName } from '../src/utils.js';

let transform = (
	projectFiles: Record<string, string>,
	targetPath: string,
	options: Options,
) => {
	let project = new Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
		},
		manipulationSettings: {
			indentationText: IndentationText.TwoSpaces,
			useTrailingCommas: true,
		},
	});

	let transformed: string | undefined;

	Object.entries(projectFiles).forEach(([path, source]) => {
		let sourceFile = project.createSourceFile(path, source);

		if (path === targetPath) {
			transformed = handleSourceFile(sourceFile, options);
		}
	});

	return transformed;
};

let fakeProvider = {
	getMatcher: (keyName: string) => (ce: CallExpression) => {
		let name = getCEExpressionName(ce);

		if (name !== 'useFlag') {
			return null;
		}

		return { name };
	},
	getReplacer: (
		key: string,
		type: VariableType,
		value: VariableValue,
		name: string,
	) => {
		return buildLiteral(type, value);
	},
};

describe('replace-feature-flag', () => {
	it('Should refactor objects', async () => {
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/object-literal-refactor.output.ts',
			),
			'utf-8',
		);

		let projectFiles = {
			'object-literal-refactor.input.ts': await readFile(
				join(
					__dirname,
					'..',
					'__testfixtures__/object-literal-refactor.input.ts',
				),
				'utf-8',
			),
		};

		let stringOptions = {
			key: 'simple-case',
			type: 'string',
			value: 'string',
			provider: fakeProvider,
		} as const;

		let transformed = transform(
			projectFiles,
			'object-literal-refactor.input.ts',
			stringOptions,
		);

		assert.deepEqual(
			transformed?.replace(/\s/gm, ''),
			OUTPUT?.replace(/\s/gm, ''),
		);
	});

	it('Should refactor variable references', async () => {
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/references-refactor.output.ts',
			),
			'utf-8',
		);

		let projectFiles = {
			'references-refactor.input.ts': await readFile(
				join(
					__dirname,
					'..',
					'__testfixtures__/references-refactor.input.ts',
				),
				'utf-8',
			),
		};

		let boolOptions = {
			key: 'simple-case',
			type: 'boolean',
			value: 'true',
			provider: fakeProvider,
		} as const;

		let transformed = transform(
			projectFiles,
			'references-refactor.input.ts',
			boolOptions,
		);

		assert.deepEqual(
			transformed?.replace(/\s/gm, ''),
			OUTPUT?.replace(/\s/gm, ''),
		);
	});

	it('Should refactor prefix unary expressions', async () => {
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/unary.output.ts'),
			'utf-8',
		);

		let projectFiles = {
			'unary.input.ts': await readFile(
				join(__dirname, '..', '__testfixtures__/unary.input.ts'),
				'utf-8',
			),
		};

		let booleanFlagOptions = {
			key: 'simple-case',
			type: 'boolean',
			value: 'true',
			provider: fakeProvider,
		} as const;

		let transformed = transform(
			projectFiles,
			'unary.input.ts',
			booleanFlagOptions,
		);

		assert.deepEqual(
			transformed?.replace(/\s/gm, ''),
			OUTPUT?.replace(/\s/gm, ''),
		);
	});

	it('Should refactor logical expressions', async () => {
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/logical-expressions.output.ts',
			),
			'utf-8',
		);

		let projectFiles = {
			'logical-expressions.input.ts': await readFile(
				join(
					__dirname,
					'..',
					'__testfixtures__/logical-expressions.input.ts',
				),
				'utf-8',
			),
		};

		let booleanFlagOptions = {
			key: 'simple-case',
			type: 'boolean',
			value: 'true',
			provider: fakeProvider,
		} as const;

		let transformed = transform(
			projectFiles,
			'logical-expressions.input.ts',
			booleanFlagOptions,
		);

		assert.deepEqual(
			transformed?.replace(/\s/gm, ''),
			OUTPUT?.replace(/\s/gm, ''),
		);
	});

	it('Should refactor binary expressions', async () => {
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/binary-expressions.output.ts',
			),
			'utf-8',
		);

		let projectFiles = {
			'binary-expressions.input.ts': await readFile(
				join(
					__dirname,
					'..',
					'__testfixtures__/binary-expressions.input.ts',
				),
				'utf-8',
			),
		};

		let booleanFlagOptions = {
			key: 'simple-case',
			type: 'boolean',
			value: 'true',
			provider: fakeProvider,
		} as const;

		let transformed = transform(
			projectFiles,
			'binary-expressions.input.ts',
			booleanFlagOptions,
		);

		assert.deepEqual(
			transformed?.replace(/\s/gm, ''),
			OUTPUT?.replace(/\s/gm, ''),
		);
	});

	it('Should refactor if statements', async () => {
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/if-statements.output.ts'),
			'utf-8',
		);

		let projectFiles = {
			'if-statements.input.ts': await readFile(
				join(
					__dirname,
					'..',
					'__testfixtures__/if-statements.input.ts',
				),
				'utf-8',
			),
		};

		let booleanFlagOptions = {
			key: 'simple-case',
			type: 'boolean',
			value: 'true',
			provider: fakeProvider,
		} as const;

		let transformed = transform(
			projectFiles,
			'if-statements.input.ts',
			booleanFlagOptions,
		);

		assert.deepEqual(
			transformed?.replace(/\s/gm, ''),
			OUTPUT?.replace(/\s/gm, ''),
		);
	});

	it('Should refactor conditional expressions', async () => {
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/conditional-expressions.output.ts',
			),
			'utf-8',
		);

		let projectFiles = {
			'conditional-expressions.input.ts': await readFile(
				join(
					__dirname,
					'..',
					'__testfixtures__/conditional-expressions.input.ts',
				),
				'utf-8',
			),
		};

		let booleanFlagOptions = {
			key: 'simple-case',
			type: 'boolean',
			value: 'true',
			provider: fakeProvider,
		} as const;

		let transformed = transform(
			projectFiles,
			'conditional-expressions.input.ts',
			booleanFlagOptions,
		);

		assert.deepEqual(
			transformed?.replace(/\s/gm, ''),
			OUTPUT?.replace(/\s/gm, ''),
		);
	});
});
