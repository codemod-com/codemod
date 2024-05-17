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

describe('react/19/replace-reactdom-render', () => {
	it('replace reactdom.render with root.render and replace imports', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/fixture1.input.js'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/fixture1.output.js'),
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
			actualOutput?.replace(/W/gm, ''),
			OUTPUT.replace(/W/gm, ''),
		);
	});

	it('replace reactdom.render with root.render and replace imports: nested', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/nested.input.js'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/nested.output.js'),
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
			actualOutput?.replace(/W/gm, ''),
			OUTPUT.replace(/W/gm, ''),
		);
	});
});
