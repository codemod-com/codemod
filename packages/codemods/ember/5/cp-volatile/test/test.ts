import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('ember 5 cp-volatile', () => {
	it('basic', () => {
		let INPUT = `
        const Person = EmberObject.extend({
            fullName: computed(function() {
              return \`\${this.firstName} \${this.lastName}\`;
            }).volatile()
          });
		`;

		let OUTPUT = `
        const Person = EmberObject.extend({
            get fullName() {
              return \`\${this.firstName} \${this.lastName}\`;
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
