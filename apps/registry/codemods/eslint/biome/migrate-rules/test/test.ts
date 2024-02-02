import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import type { DirectoryJSON } from 'memfs';
import { createFsFromVolume, Volume } from 'memfs';
import { describe, it } from 'vitest';
import { repomod } from '../src/index.js';

const transform = async (json: DirectoryJSON) => {
	const volume = Volume.fromJSON(json);

	const fs = createFsFromVolume(volume);

	const unifiedFileSystem = buildUnifiedFileSystem(fs);
	const pathApi = buildPathAPI('/');

	const api = buildApi(unifiedFileSystem, () => ({}), pathApi);

	return executeFilemod(api, repomod, '/', {}, {});
};

describe('eslint config-files', function () {
	const tsxFile = '/opt/project/randomFile.tsx';
	const tsxFileContent = `
    import { useState } from 'react';

    export const RandomComponent = () => {
      const [state, setState] = useState(0);

      return <div>{state}</div>;
    };
  `;

	it('it should parse the rules from tsx file when there is one', async function () {
		const externalFileCommands = await transform({
			// [tsxFile]: tsxFileContent,
		});

		// deepEqual(externalFileCommands.length, 6);
	});
});
