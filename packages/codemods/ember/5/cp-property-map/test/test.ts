import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('ember 5 cp-property-map', () => {
	it('basic', () => {
		let INPUT = `
		const Person = EmberObject.extend({
            friendNames: map('friends', function(friend) {
              return friend[this.get('nameKey')];
            }).property('nameKey')
          });
		`;

		let OUTPUT = `
		const Person = EmberObject.extend({
            friendNames: map('friends', ['nameKey'], function(friend) {
              return friend[this.get('nameKey')];
            })
          });
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
