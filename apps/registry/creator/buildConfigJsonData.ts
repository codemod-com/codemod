import type { ArgvSchema } from './schema.js';

export const buildConfigJsonData = (argv: ArgvSchema): string => {
	if (argv.engine === 'jscodeshift') {
		return JSON.stringify({
			schemaVersion: '1.0.0',
			engine: 'jscodeshift',
			arguments: [],
		});
	}

	// TODO
	return '';
};
