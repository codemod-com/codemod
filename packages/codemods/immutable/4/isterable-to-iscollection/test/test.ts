import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('immutable-4 isiterable-to-iscollection', () => {
	it('should change the isIterable identifier into the isCollection identifier', () => {
		let INPUT = `
            Immutable.Iterable.isIterable();
        `;

		let OUTPUT = `
            Immutable.Iterable.isCollection()
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
