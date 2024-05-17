import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

let __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('react-router v6 remove-redirect-inside-switch', () => {
	it('should remove Redirect inside Switch', async () => {
		let input = await readFile(join(__dirname, 'input.js'), {
			encoding: 'utf8',
		});

		let output = await readFile(join(__dirname, 'output.js'), {
			encoding: 'utf8',
		});

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('js'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});
});
