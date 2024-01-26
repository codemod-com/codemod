import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('netlify 0.8.1 addBuildEventContext', function () {
	it('changes addBuildHook to addBuildEventContext', function () {
		const INPUT = `
			integration.addBuildHook("onPreBuild", () => {});
        `;

		const OUTPUT = `
			integration.addBuildEventHandler("onPreBuild", () => {});
		`;

		const fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
