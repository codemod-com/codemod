import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import jscodeshift, { type API } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

let buildApi = (parser: string | undefined): API => ({
	j: parser ? jscodeshift.withParser(parser) : jscodeshift,
	jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
	stats: () => {
		console.error(
			'The stats function was called, which is not supported on purpose',
		);
	},
	report: () => {
		console.error(
			'The report function was called, which is not supported on purpose',
		);
	},
});

describe('react/19/replace-string-ref', () => {
	it('Should replace string refs in class components: default import', async () => {
		let INPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/class-component-default-import.input.tsx',
			),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/class-component-default-import.output.tsx',
			),
			'utf-8',
		);

		let actualOutput = transform(
			{
				path: 'index.js',
				source: INPUT,
			},
			buildApi('tsx'),
		);

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Should replace string refs in class components: named import', async () => {
		let INPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/class-component-named-import.input.tsx',
			),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/class-component-named-import.output.tsx',
			),
			'utf-8',
		);

		let actualOutput = transform(
			{
				path: 'index.js',
				source: INPUT,
			},
			buildApi('tsx'),
		);

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Should replace string refs in class components: custom import names', async () => {
		let INPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/class-component-custom-import-names.input.tsx',
			),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/class-component-custom-import-names.output.tsx',
			),
			'utf-8',
		);

		let actualOutput = transform(
			{
				path: 'index.js',
				source: INPUT,
			},
			buildApi('tsx'),
		);

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Should ignore functional components', async () => {
		let INPUT = await readFile(
			join(
				__dirname,
				'..',
				'__testfixtures__/function-component.input.tsx',
			),
			'utf-8',
		);

		let actualOutput = transform(
			{
				path: 'index.js',
				source: INPUT,
			},
			buildApi('tsx'),
		);

		assert.deepEqual(actualOutput, undefined);
	});
});
