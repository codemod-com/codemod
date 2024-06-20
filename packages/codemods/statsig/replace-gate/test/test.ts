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

describe('replace-gate', () => {
	it('Should replace gate with boolean value', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/statsig.input.js'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/statsig.output.js'),
			'utf-8',
		);

		let { actual, expected } = transform(INPUT, OUTPUT, 'index.tsx', {
			key: 'the-gate',
			type: 'boolean',
			value: 'true',
		});

		assert.deepEqual(actual, expected);
	});
});
