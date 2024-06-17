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
	it('Should replace feature flag with boolean value', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/devcycle.input.js'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/devcycle.output.js'),
			'utf-8',
		);

		let { actual, expected } = transform(INPUT, OUTPUT, 'index.tsx', {
			key: 'simple-case',
			type: 'boolean',
			value: 'true',
		});

		assert.deepEqual(actual, expected);
	});

	it('Should replace feature flag with object value', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/object.input.js'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/object.output.js'),
			'utf-8',
		);

		let { actual, expected } = transform(INPUT, OUTPUT, 'index.tsx', {
			key: 'simple-case',
			type: 'JSON',
			value: `{ "foo": { "bar": null, "baz": "str", "faz": 12 } }`,
		});

		assert.deepEqual(actual, expected);
	});
});
