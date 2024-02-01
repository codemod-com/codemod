import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApi, trimLicense } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('react-router v4 create-hash-history', function () {
	it('should add createHashHistory', async function () {
		const input = await readFile(join(__dirname, 'input.js'), {
			encoding: 'utf8',
		});

		const output = await readFile(join(__dirname, 'output.js'), {
			encoding: 'utf8',
		});

		const fileInfo: FileInfo = {
			path: 'index.js',
			source: trimLicense(input),
		};

		const actualOutput = transform(fileInfo, buildApi('js'), {
			quote: 'single',
		});

		console.log(output, actualOutput, '??');

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			trimLicense(output).replace(/\W/gm, ''),
		);
	});
});
