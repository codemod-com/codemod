import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('remove-public-modifier', () => {
	it('one variable', function () {
		const INPUT = `
				class MyClass {
					public myProperty: string;
				
					public constructor() {
					}
				
					public myMethod(): void {
					}
				}  
			`;

		const OUTPUT = `
				class MyClass {
					myProperty: string;
				
					constructor() {
					}
				
					myMethod(): void {
					}
				}
			`;
		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
