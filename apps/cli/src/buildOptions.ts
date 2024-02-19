import { Argv } from 'yargs';
import {
	DEFAULT_DRY_RUN,
	DEFAULT_EXCLUDE_PATTERNS,
	DEFAULT_INCLUDE_PATTERNS,
	DEFAULT_NO_CACHE,
	DEFAULT_THREAD_COUNT,
	DEFAULT_USE_JSON,
	DEFAULT_USE_PRETTIER,
} from './constants.js';

export const buildUseJsonOption = <T extends Record<string, unknown>>(
	y: Argv<T>,
) =>
	y.option('json', {
		type: 'boolean',
		description: 'Respond with JSON',
		default: DEFAULT_USE_JSON,
	});

export const buildUseCacheOption = <T extends Record<string, unknown>>(
	y: Argv<T>,
) =>
	y.option('no-cache', {
		type: 'boolean',
		description: 'Disable cache for HTTP(S) requests',
		default: DEFAULT_NO_CACHE,
	});

export const buildOptions = <T extends Record<string, unknown>>(y: Argv<T>) => {
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
				.option('source', {
					type: 'string',
					description: 'Source path of the local codemod to run',
				})
				.option('engine', {
					type: 'string',
					description:
						'The engine to use with the local codemod: "jscodeshift", "ts-morph", "filemod"',
				})
				.option('limit', {
					type: 'number',
					description: 'File limit for processing',
					default: 1000,
				})
				.option('prettier', {
					type: 'boolean',
					description: 'Format output with Prettier',
					default: DEFAULT_USE_PRETTIER,
				})
				.option('threads', {
					type: 'number',
					description: 'Number of worker threads',
					default: DEFAULT_THREAD_COUNT,
				})
				.option('dry', {
					type: 'boolean',
					description: 'Perform a dry run',
					default: DEFAULT_DRY_RUN,
				})
				.option('telemetryDisable', {
					type: 'boolean',
					description: 'Disable telemetry',
				}),
		),
	);
};
