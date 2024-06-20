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

	let api = buildApi<{
		jscodeshift: typeof jscodeshift;
	}>(
		unifiedFileSystem,
		() => ({
			jscodeshift,
		}),
		pathApi,
	);

	return executeFilemod(
		api,
		repomod,
		'/',
		{
			fileMarker: 'marker',
			featureFlagName: 'featureFlagA',
			functionName: 'buildFeatureFlag',
		},
		{},
	);
};

let directoryJSON: DirectoryJSON = {
	'/opt/project/featureFlags.ts': `
		const marker = 'marker';

		export const featureFlagObject = buildFeatureFlag({
			key: 'featureFlagA',
		});
	`,
	'/opt/project/component.ts': `
		export async function Component() {
			const a = await featureFlagObject();
		}
	`,
};

describe('remove unused feature flags 2', () => {
	it('should build correct files', async () => {
		let externalFileCommands = await transform(directoryJSON);

		deepStrictEqual(externalFileCommands.length, 1);

		deepStrictEqual(externalFileCommands[0], {
			kind: 'upsertFile',
			path: '/opt/project/component.ts',
			data: '\n\t\texport async function Component() {\n\t\t\tconst a = true;\n\t\t}\n\t',
		});
	});
});
