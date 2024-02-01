import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
<<<<<<< HEAD
import { buildApi, trimLicense } from '@codemod-com/utilities';
=======
import { buildApi } from '@codemod-com/utilities';
>>>>>>> cb9de9e (wip)
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('react-router v4 hash-router', function () {
	it('should replace Router component with HashRouter, add HashRouter import', async function () {
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

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			trimLicense(output).replace(/\W/gm, ''),
		);
	});
});
