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

describe('launchdarkly-to-devcycle', () => {
	it('Should replace withLDProvider HOC', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/withLDProvider.input.ts'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/withLDProvider.output.ts'),
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

	it('Should replace useFlags hook', async () => {
		let INPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/useFlags.input.ts'),
			'utf-8',
		);
		let OUTPUT = await readFile(
			join(__dirname, '..', '__testfixtures__/useFlags.output.ts'),
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
