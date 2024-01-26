import type { ArgvSchema } from './schema.js';

export const buildMochaRcJsonData = (argv: ArgvSchema): string | null => {
	if (argv.engine === 'piranha' || argv.engine === 'recipe') {
		return null;
	}

	return JSON.stringify({
		loader: ['ts-node/esm'],
		'full-trace': true,
		failZero: false,
		bail: true,
		spec: './**/test.ts',
		timeout: 5000,
	});
};
