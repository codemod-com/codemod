import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('ember 5 ember-jquery-legacy', () => {
	it('basic', () => {
		let INPUT = `
		export default Component.extend({
            click(event) {
              let nativeEvent = event.originalEvent;
            }
            });
		`;

		let OUTPUT = `
		import { normalizeEvent } from "ember-jquery-legacy";
        export default Component.extend({
        click(event) {
        let nativeEvent = normalizeEvent(event);
        }
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
