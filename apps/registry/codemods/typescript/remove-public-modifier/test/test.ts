import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('remove-public-modifier', () => {
	it('basic', function () {
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

	it('no public modifier', function () {
		const INPUT = `
				class MyClass {
					myMethod(): void {
					}
					
					myProperty: string = 'value';
				}  
			`;

		const OUTPUT = `
				class MyClass {
					myMethod(): void {
					}
					
					myProperty: string = 'value';
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

	it('class with other modifiers (static, readonly)', function () {
		const INPUT = `
				class MyClass {
					public static readonly myProperty: string = 'value';
				}		  
			`;

		const OUTPUT = `
				class MyClass {
					static readonly myProperty: string = 'value';
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

	it('multiple classes in the same file', function () {
		const INPUT = `
				class Class1 {
					public method1(): void {}
				}
				
				class Class2 {
					public method2(): void {}
				}	  
			`;

		const OUTPUT = `
				class Class1 {
					method1(): void {}
				}
				
				class Class2 {
					method2(): void {}
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
