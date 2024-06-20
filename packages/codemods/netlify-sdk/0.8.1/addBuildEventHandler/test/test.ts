import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('netlify 0.8.1 addBuildEventContext', () => {
	it('changes addBuildHook to addBuildEventContext', () => {
		let INPUT = `
			integration.addBuildHook("onPreBuild", () => {});
        `;

		let OUTPUT = `
			integration.addBuildEventHandler("onPreBuild", () => {});
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
