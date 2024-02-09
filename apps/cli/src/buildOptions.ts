import { Argv } from 'yargs';
import {
	DEFAULT_DRY_RUN,
	DEFAULT_EXCLUDE_PATTERNS,
	DEFAULT_INCLUDE_PATTERNS,
	DEFAULT_THREAD_COUNT,
	DEFAULT_USE_CACHE,
	DEFAULT_USE_JSON,
	DEFAULT_USE_PRETTIER,
} from './constants.js';

// eslint-disable-next-line @typescript-eslint/ban-types
export const buildUseJsonOption = <T extends {}>(y: Argv<T>) =>
	y.option('useJson', {
		type: 'boolean',
		description: 'Respond with JSON',
		default: DEFAULT_USE_JSON,
	});

// eslint-disable-next-line @typescript-eslint/ban-types
export const buildUseCacheOption = <T extends {}>(y: Argv<T>) =>
	y.option('useCache', {
		type: 'boolean',
		description: 'Use cache for HTTP(S) requests',
		default: DEFAULT_USE_CACHE,
	});

// eslint-disable-next-line @typescript-eslint/ban-types
export const buildOptions = <T extends {}>(y: Argv<T>) => {
	return buildUseCacheOption(
		buildUseJsonOption(
			y
				.option('include', {
					type: 'string',
					array: true,
					description: 'Glob pattern(s) for files to include',
					default: DEFAULT_INCLUDE_PATTERNS,
				})
				.option('exclude', {
					type: 'string',
					array: true,
					description: 'Glob pattern(s) for files to exclude',
					default: DEFAULT_EXCLUDE_PATTERNS,
				})
				.option('target', {
					type: 'string',
					description: 'Input directory path',
				})
				.option('targetPath', {
					type: 'string',
					description:
						'(DEPRECATED by "target") Input directory path',
				})
				.option('source', {
					type: 'string',
					description: 'Source path of the local codemod to run',
				})
				.option('sourcePath', {
					type: 'string',
					description:
						'(DEPRECATED by "source") Source path of the local codemod to run',
				})
				.option('codemodEngine', {
					type: 'string',
					description:
						'The engine to use with the local codemod: "jscodeshift", "ts-morph", "filemod"',
				})
				.option('fileLimit', {
					type: 'number',
					description: 'File limit for processing',
					default: 1000,
				})
				.option('usePrettier', {
					type: 'boolean',
					description: 'Format output with Prettier',
					default: DEFAULT_USE_PRETTIER,
				})
				.option('threadCount', {
					type: 'number',
					description: 'Number of worker threads',
					default: DEFAULT_THREAD_COUNT,
				})
				.option('dryRun', {
					type: 'boolean',
					description: 'Perform a dry run',
					default: DEFAULT_DRY_RUN,
				})
				.option('outputDirectoryPath', {
					type: 'string',
					description:
						'(DEPRECATED, do not use) Output directory path for dry-run only',
				})
				.option('telemetryDisable', {
					type: 'boolean',
					description: 'Disable telemetry',
				}),
		),
	);
};
