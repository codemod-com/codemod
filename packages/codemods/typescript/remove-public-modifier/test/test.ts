import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('remove-public-modifier', () => {
	it('basic', () => {
		let INPUT = `
				class MyClass {
					public myProperty: string;
				
					public constructor() {
					}
				
					public myMethod(): void {
					}
				}  
			`;

		let OUTPUT = `
				class MyClass {
					myProperty: string;
				
					constructor() {
					}
				
					myMethod(): void {
					}
				}
			`;
		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('no public modifier', () => {
		let INPUT = `
				class MyClass {
					myMethod(): void {
					}
					
					myProperty: string = 'value';
				}  
			`;

		let OUTPUT = `
				class MyClass {
					myMethod(): void {
					}
					
					myProperty: string = 'value';
				}
			`;
		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('class with other modifiers (static, readonly)', () => {
		let INPUT = `
				class MyClass {
					public static readonly myProperty: string = 'value';
				}		  
			`;

		let OUTPUT = `
				class MyClass {
					static readonly myProperty: string = 'value';
				}	
			`;
		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('multiple classes in the same file', () => {
		let INPUT = `
				class Class1 {
					public method1(): void {}
				}
				
				class Class2 {
					public method2(): void {}
				}	  
			`;

		let OUTPUT = `
				class Class1 {
					method1(): void {}
				}
				
				class Class2 {
					method2(): void {}
				}	
			`;
		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
