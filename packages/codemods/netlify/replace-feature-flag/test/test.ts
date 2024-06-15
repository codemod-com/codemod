import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Project } from 'ts-morph';
import { describe, it } from 'vitest';
import type { Options } from '../../../replace-feature-flag-core/src/types.js';
import { handleSourceFile } from '../src/index.js';

let transform = (
	beforeText: string,
	afterText: string,
	path: string,
	options: Omit<Options, 'provider'>,
) => {
	let project = new Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
		},
	});

	let actualSourceFile = project.createSourceFile(path, beforeText);

	let actual = handleSourceFile(actualSourceFile, options)?.replace(
		/\s/gm,
		'',
	);

	let expected = project
		.createSourceFile(`expected${extname(path)}`, afterText)
		.getFullText()
		.replace(/\s/gm, '');

	return {
		actual,
		expected,
	};
};

describe('Replace feature flag', () => {
	it('Should remove type literal property in FlagDict type literal', async () => {
		let INPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/typeLiteralProperty.input.ts',
			),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/typeLiteralProperty.output.ts',
			),
			'utf-8',
		);

		let { actual, expected } = transform(
			INPUT,
			OUTPUT,
			'./FeatureFlagProvider.tsx',
			{
				key: 'the_key',
				type: 'boolean',
				value: 'true',
			},
		);

		assert.deepEqual(actual, expected);
	});

	it('Should remove mockFlags from MockFeatureFlag', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/mockFlags.input.tsx'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/mockFlags.output.tsx'),
			'utf-8',
		);

		let { actual, expected } = transform(INPUT, OUTPUT, './test.spec.tsx', {
			key: 'the_key',
			type: 'boolean',
			value: 'true',
		});

		assert.deepEqual(actual, expected);
	});
});
