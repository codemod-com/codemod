import { deepStrictEqual } from 'node:assert';
import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import jscodeshift from 'jscodeshift';
import type { DirectoryJSON } from 'memfs';
import { Volume, createFsFromVolume } from 'memfs';
import { describe, it } from 'vitest';
import { repomod } from '../src/index.js';

let transform = async (json: DirectoryJSON) => {
	let volume = Volume.fromJSON(json);
	let fs = createFsFromVolume(volume);

	let unifiedFileSystem = buildUnifiedFileSystem(fs);
	let pathApi = buildPathAPI('/');

	let api = buildApi<{ jscodeshift: typeof jscodeshift }>(
		unifiedFileSystem,
		() => ({
			jscodeshift,
		}),
		pathApi,
	);

	return executeFilemod(api, repomod, '/', {}, {});
};

type ExternalFileCommand = Awaited<ReturnType<typeof transform>>[number];

let removeWhitespaces = (command: ExternalFileCommand): ExternalFileCommand => {
	if (command.kind !== 'upsertFile') {
		return command;
	}

	return {
		...command,
		data: command.data.replace(/\s/gm, ''),
	};
};

describe('ab-test', () => {
	it('should build correct files', async () => {
		let [middlewareTsCommand, abTestMiddlewareTsCommand] = await transform({
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
