import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('ember 5 deprecate-merge', () => {
	it('basic', () => {
		let INPUT = `
		import { merge } from '@ember/polyfills';

        var a = { first: 'Yehuda' };
        var b = { last: 'Katz' };
        merge(a, b);
		`;

		let OUTPUT = `
		import { assign } from '@ember/polyfills';

        var a = { first: 'Yehuda' };
        var b = { last: 'Katz' };
        assign(a, b);
        `;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('js'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
