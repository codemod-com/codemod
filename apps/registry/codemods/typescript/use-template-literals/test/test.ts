import transform from '../src/index.js';
import { describe, it } from 'vitest';
import { FileInfo } from 'jscodeshift';
import assert from 'node:assert';
import { buildApi } from '@codemod-registry/utilities';

describe('use-template-literals', () => {
	describe('variables declared with let', function () {
		it('one variable', function () {
			const INPUT = `
				let name = 'John';
				let greeting = 'Hello, ' + name + '!';
			`;

			const OUTPUT = `
				let name = 'John';
				let greeting = \`Hello, \${name}!\`;
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

		it('two variables', function () {
			const INPUT = `
				let name = 'John';
				let age = 12;
				let greeting = name + 'is ' + age + ' years old!';
			`;

			const OUTPUT = `
				let name = 'John';
				let age = 12;
				let greeting = \`\${name} is \${age} years old!\`;
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

		it('three variables', function () {
			const INPUT = `
				let name = 'John';
				let age = 12;
				let gender = 'male';
				let greeting = name + age + gender;
			`;

			const OUTPUT = `
				let name = 'John';
				let age = 12;
				let gender = 'male';
				let greeting = \`\${name}\${age}\${gender}\`;
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

	describe('variables declared with var', function () {
		it('one variable', function () {
			const INPUT = `
				var name = 'John';
				var greeting = 'Hello, ' + name + '!';
			`;

			const OUTPUT = `
				var name = 'John';
				var greeting = \`Hello, \${name}!\`;
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

		it('two variables', function () {
			const INPUT = `
				var name = 'John';
				var age = 12;
				var greeting = name + 'is ' + age + ' years old!';
			`;

			const OUTPUT = `
				var name = 'John';
				var age = 12;
				var greeting = \`\${name} is \${age} years old!\`;
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

		it('three variables', function () {
			const INPUT = `
				var name = 'John';
				var age = 12;
				var gender = 'male';
				var greeting = name + age + gender;
			`;

			const OUTPUT = `
				var name = 'John';
				var age = 12;
				var gender = 'male';
				var greeting = \`\${name}\${age}\${gender}\`;
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
});
