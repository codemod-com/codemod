import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('netlify 0.8.1 disableBuildEventHandlers', () => {
	it('changes disableBuildhook to disableBuildEventHandlers', () => {
		let INPUT = `
			await client.disableBuildhook(siteId);
        `;

		let OUTPUT = `
			await client.disableBuildEventHandlers(siteId);
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
