import { deepStrictEqual } from 'node:assert';
import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import jscodeshift from 'jscodeshift';
import type { DirectoryJSON } from 'memfs';
import { createFsFromVolume, Volume } from 'memfs';
import { describe, it } from 'vitest';
import { repomod } from '../src/index.js';

const transform = async (json: DirectoryJSON) => {
	const volume = Volume.fromJSON(json);
	const fs = createFsFromVolume(volume);

	const unifiedFileSystem = buildUnifiedFileSystem(fs);
	const pathApi = buildPathAPI('/');

	const api = buildApi<{ jscodeshift: typeof jscodeshift }>(
		unifiedFileSystem,
		() => ({
			jscodeshift,
		}),
		pathApi,
	);

	return executeFilemod(api, repomod, '/', {}, {});
};

type ExternalFileCommand = Awaited<ReturnType<typeof transform>>[number];

const removeWhitespaces = (
	command: ExternalFileCommand,
): ExternalFileCommand => {
	if (command.kind !== 'upsertFile') {
		return command;
	}

	return {
		...command,
		data: command.data.replace(/\s/gm, ''),
	};
};

describe('ab-test', function () {
	it('should build correct files', async function () {
		const [middlewareTsCommand, abTestMiddlewareTsCommand] =
			await transform({
				'/opt/project/middleware.ts': `
				const middleware = async () => {};
				export default middleware;
				`,
			});

		deepStrictEqual(
			removeWhitespaces(middlewareTsCommand!),
			removeWhitespaces({
				kind: 'upsertFile',
				path: '/opt/project/middleware.ts',
				data: `
			import { abTestMiddlewareFactory } from "abTestMiddlewareFactory";
			const middleware = async () => {};
			export default abTestMiddlewareFactory(middleware);
			`,
			}),
		);

		deepStrictEqual(abTestMiddlewareTsCommand.kind, 'upsertFile');
		deepStrictEqual(
			abTestMiddlewareTsCommand.path,
			'/opt/project/abTestMiddlewareFactory.ts',
		);
	});
});
