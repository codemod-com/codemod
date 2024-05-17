import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('use-template-literals', () => {
	describe('variables declared with let', () => {
		it('one variable', () => {
			let INPUT = `
				let name = 'John';
				let greeting = 'Hello, ' + name + '!';
			`;

			let OUTPUT = `
				let name = 'John';
				let greeting = \`Hello, \${name}!\`;
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

		it('two variables', () => {
			let INPUT = `
				let name = 'John';
				let age = 12;
				let greeting = name + 'is ' + age + ' years old!';
			`;

			let OUTPUT = `
				let name = 'John';
				let age = 12;
				let greeting = \`\${name} is \${age} years old!\`;
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

		it('three variables', () => {
			let INPUT = `
				let name = 'John';
				let age = 12;
				let gender = 'male';
				let greeting = name + age + gender;
			`;

			let OUTPUT = `
				let name = 'John';
				let age = 12;
				let gender = 'male';
				let greeting = \`\${name}\${age}\${gender}\`;
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

	describe('variables declared with var', () => {
		it('one variable', () => {
			let INPUT = `
				var name = 'John';
				var greeting = 'Hello, ' + name + '!';
			`;

			let OUTPUT = `
				var name = 'John';
				var greeting = \`Hello, \${name}!\`;
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

		it('two variables', () => {
			let INPUT = `
				var name = 'John';
				var age = 12;
				var greeting = name + 'is ' + age + ' years old!';
			`;

			let OUTPUT = `
				var name = 'John';
				var age = 12;
				var greeting = \`\${name} is \${age} years old!\`;
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

		it('three variables', () => {
			let INPUT = `
				var name = 'John';
				var age = 12;
				var gender = 'male';
				var greeting = name + age + gender;
			`;

			let OUTPUT = `
				var name = 'John';
				var age = 12;
				var gender = 'male';
				var greeting = \`\${name}\${age}\${gender}\`;
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

	describe('variables declared with const', () => {
		it('one variable', () => {
			let INPUT = `
				const name = 'John';
				const greeting = 'Hello, ' + name + '!';
			`;

			let OUTPUT = `
				const name = 'John';
				const greeting = \`Hello, \${name}!\`;
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

		it('two variables', () => {
			let INPUT = `
				const name = 'John';
				const age = 12;
				const greeting = name + 'is ' + age + ' years old!';
			`;

			let OUTPUT = `
				const name = 'John';
				const age = 12;
				const greeting = \`\${name} is \${age} years old!\`;
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

		it('three variables', () => {
			let INPUT = `
				const name = 'John';
				const age = 12;
				const gender = 'male';
				const greeting = name + age + gender;
			`;

			let OUTPUT = `
				const name = 'John';
				const age = 12;
				const gender = 'male';
				const greeting = \`\${name}\${age}\${gender}\`;
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
});
