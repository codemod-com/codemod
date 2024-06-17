import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('ember 5 notify-property-change', () => {
	it('basic', () => {
		let INPUT = `
		Ember.propertyWillChange(object, 'someProperty');
		doStuff(object);
		Ember.propertyDidChange(object, 'someProperty');

		object.propertyWillChange('someProperty');
		doStuff(object);
		object.propertyDidChange('someProperty');
		`;

		let OUTPUT = `
		doStuff(object);
		Ember.notifyPropertyChange(object, 'someProperty');
		
		doStuff(object);
		object.notifyPropertyChange('someProperty');
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
