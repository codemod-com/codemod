import type { ArgvSchema } from './schema.js';

export const buildSrcIndexTsData = (argv: ArgvSchema): string | null => {
	if (argv.engine === 'jscodeshift') {
		return [
			'/*! @license */',
			'',
			'import { type Transform } from "jscodeshift"',
			'',
			'const transform: Transform = (file, api, options) => {',
			'   return undefined;',
			'}',
			'',
			'export default transform;',
			'',
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
