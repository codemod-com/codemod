import type { ArgvSchema } from './schema.js';

export const buildTestTestTsData = (argv: ArgvSchema): string | null => {
	if (argv.engine === 'jscodeshift') {
		return [
			`import { FileInfo } from 'jscodeshift';`,
			`import assert from 'node:assert';`,
			`import transform from '../src/index.js';`,
			`import { buildApi } from '@codemod-com/utilities';`,
			'',
			`describe("${argv.name}", function () {`,
			`   it('should transform', function () {`,
			`       const INPUT = '';`,
			`       const OUTPUT = '';`,
			'',
			`       const fileInfo: FileInfo = {`,
			`           path: 'index.js',`,
			`           source: INPUT,`,
			`       };`,
			'',
			`       const actualOutput = transform(fileInfo, buildApi('js'), {});`,
			'',
			`       assert.deepEqual(`,
			`           actualOutput?.replace(/\W/gm, ''),`,
			`           OUTPUT.replace(/\W/gm, ''),`,
			`       );`,
			'   });',
			'});',
		].join('\n');
	}

	if (argv.engine === 'ts-morph') {
		return '';
	}

	if (argv.engine === 'filemod') {
		return '';
	}

	return null;
};
