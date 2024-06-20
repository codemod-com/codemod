import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import jscodeshift, { type API, type FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

export let buildApi = (parser: string | undefined): API => ({
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

describe('react/19/replace-act-import: TestUtils.act -> React.act', () => {
	describe('javascript code', () => {
		it('should replace direct import with import from react', async () => {
			let INPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture1.input.js'),
				'utf-8',
			);
			let OUTPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture1.output.js'),
				'utf-8',
			);

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});

		it('should replace TestUtils.act with React.act', async () => {
			let INPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture2.input.js'),
				'utf-8',
			);
			let OUTPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture2.output.js'),
				'utf-8',
			);

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});

		it('should properly replace star import', async () => {
			let INPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture3.input.js'),
				'utf-8',
			);
			let OUTPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture3.output.js'),
				'utf-8',
			);

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});

		it('should not replace other imports from test utils', async () => {
			let INPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture4.input.js'),
				'utf-8',
			);
			let OUTPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture4.output.js'),
				'utf-8',
			);

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});

		it('should not add react import if one is already present', async () => {
			let INPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture5.input.js'),
				'utf-8',
			);
			let OUTPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture5.output.js'),
				'utf-8',
			);

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});

		it('should add import specifier to existing import if it exists', async () => {
			let INPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture6.input.js'),
				'utf-8',
			);
			let OUTPUT = await readFile(
				join(__dirname, '..', '__testfixtures__/fixture6.output.js'),
				'utf-8',
			);

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});
	});
});
