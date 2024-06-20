import { deepStrictEqual } from 'node:assert';
import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import type { DirectoryJSON } from 'memfs';
import { Volume, createFsFromVolume } from 'memfs';
import { describe, it } from 'vitest';
import { buildData, repomod } from '../src/index.js';

let transform = async (json: DirectoryJSON) => {
	let volume = Volume.fromJSON(json);
	let fs = createFsFromVolume(volume);

	let unifiedFileSystem = buildUnifiedFileSystem(fs);
	let pathApi = buildPathAPI('/');

	let api = buildApi<Record<string, never>>(
		unifiedFileSystem,
		() => ({}),
		pathApi,
	);

	return executeFilemod(api, repomod, '/', { testPath: '/opt/tests' }, {});
};

type ExternalFileCommand = Awaited<ReturnType<typeof transform>>[number];

let removeWhitespaces = (command: ExternalFileCommand): ExternalFileCommand => {
	if (command.kind !== 'upsertFile') {
		return command;
	}

	return {
		...command,
		data: command.data.replace(/\s/, ''),
	};
};

describe('generate-metadata-tests', () => {
	it('should build correct files', async () => {
		let [command] = await transform({
			'/opt/project/pages/a/index.tsx': '',
		});

		let data = buildData('a').replace(/\s/, '');

		deepStrictEqual(removeWhitespaces(command!), {
			kind: 'upsertFile',
			path: '/opt/tests/a.e2e.ts',
			data,
		});
	});

	it('should build correct files', async () => {
		let [command] = await transform({
			'/opt/project/pages/a/[b].tsx': '',
		});

		let data = buildData('a/[b]').replace(/\s/, '');

		deepStrictEqual(removeWhitespaces(command!), {
			kind: 'upsertFile',
			path: '/opt/tests/a/[b].e2e.ts',
			data,
		});
	});

	it('should build correct files', async () => {
		let [command] = await transform({
			'/opt/project/pages/a/[b]/c.tsx': '',
		});

		let data = buildData('a/[b]/c').replace(/\s/, '');

		deepStrictEqual(removeWhitespaces(command!), {
			kind: 'upsertFile',
			path: '/opt/tests/a/[b]/c.e2e.ts',
			data,
		});
	});
});
