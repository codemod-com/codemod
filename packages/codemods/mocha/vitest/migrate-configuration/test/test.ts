import { deepEqual, equal, ok } from 'node:assert';
import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import type { DirectoryJSON } from 'memfs';
import { Volume, createFsFromVolume } from 'memfs';
import { describe, it } from 'vitest';
import { repomod } from '../src/index.js';

let transform = async (json: DirectoryJSON) => {
	let volume = Volume.fromJSON(json);

	let fs = createFsFromVolume(volume);

	let unifiedFileSystem = buildUnifiedFileSystem(fs);
	let pathApi = buildPathAPI('/');

	let api = buildApi(unifiedFileSystem, () => ({}), pathApi);

	return executeFilemod(api, repomod, '/', {}, {});
};

describe('mocha config-files', () => {
	let packageJsonPath = '/opt/project/package.json';
	let packageJsonContent = `
    {
      "name": "package-name",
      "dependencies": {
        "mocha": "^10.2.0",
        "some-mocha-plugin": "^10.0.4"
      },
      "devDependencies": {
        "mocha": "^10.2.0",
        "@types/mocha": "^10.0.4"
      },
      "main": "./dist/index.cjs",
      "scripts": {
                "test": "mocha"
      },
      "mocha": {
        "config-key": "config-value"
      },
      "files": [
        "README.md",
        ".codemodrc.json",
        "./dist/index.cjs"
      ],
      "type": "module"
    }
  `;

	let tsconfigPath = '/opt/project/tsconfig.json';
	let tsconfigContent = `
    {
      "compilerOptions": { "types": ["mocha"] },
      "include": [
        "./src/**/*.ts",
        "./src/**/*.js",
        "./test/**/*.ts",
        "./test/**/*.js"
      ]
    }
  `;

	let mochaRcPath = '/opt/project/.mocharc';
	let mochaRcCjsPath = '/opt/project/.mocharc.cjs';
	let mochaConfigPath = '/opt/project/mocha.config.mjs';
	let mochaRcContent = `
    {
      "loader": ["ts-node/esm"],
      "full-trace": true,
      "failZero": false,
      "bail": true,
      "spec": "./**/test.ts",
      "timeout": 5000
    }
  `;

	let gitIgnorePath = '/opt/project/.gitignore';
	let gitIgnoreContent = `
    build
    dist
    node_modules
  `;

	let vitestConfigPath = 'vitest.config.ts';

	it('should contain correct file commands', async () => {
		let externalFileCommands = await transform({
			[packageJsonPath]: packageJsonContent,
			[tsconfigPath]: tsconfigContent,
			[mochaRcPath]: mochaRcContent,
			[mochaRcCjsPath]: mochaRcContent,
			[mochaConfigPath]: mochaRcContent,
			[gitIgnorePath]: gitIgnoreContent,
			[vitestConfigPath]: '',
		});

		deepEqual(externalFileCommands.length, 7);

		ok(
			externalFileCommands.filter(
				(command) =>
					(command.kind === 'upsertFile' &&
						command.path === packageJsonPath) ||
					(command.kind === 'upsertFile' &&
						command.path === tsconfigPath) ||
					(command.kind === 'deleteFile' &&
						command.path === mochaRcPath) ||
					(command.kind === 'deleteFile' &&
						command.path === mochaRcCjsPath) ||
					(command.kind === 'deleteFile' &&
						command.path === mochaConfigPath) ||
					(command.kind === 'upsertFile' &&
						command.path === gitIgnorePath) ||
					(command.kind === 'upsertFile' &&
						command.path === vitestConfigPath),
			).length === externalFileCommands.length,
		);
	});

	it('should correctly modify package and tsconfig jsons', async () => {
		let externalFileCommands = await transform({
			[packageJsonPath]: packageJsonContent,
			[tsconfigPath]: tsconfigContent,
			[mochaRcPath]: mochaRcContent,
			[mochaRcCjsPath]: mochaRcContent,
			[mochaConfigPath]: mochaRcContent,
		});

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === packageJsonPath &&
					command.data.replace(/\W/gm, '') ===
						`
              {
                "name": "package-name",
                "dependencies": {},
                "devDependencies": {
                  "vitest": "^1.0.1",
                  "@vitest/coverage-v8": "^1.0.1"
                },
                "main": "./dist/index.cjs",
                "scripts": {
                  "test": "vitest run",
                  "test:watch": "vitest watch",
                  "coverage": "vitest run --coverage"
                },
                "files": [
                  "README.md",
                  ".codemodrc.json",
                  "./dist/index.cjs"
                ],
                "type": "module"
              }
            `.replace(/\W/gm, ''),
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === tsconfigPath &&
					command.data.replace(/\W/gm, '') ===
						`
              {
                "compilerOptions": {},
                "include": [
                  "./src/**/*.ts",
                  "./src/**/*.js",
                  "./test/**/*.ts",
                  "./test/**/*.js"
                ]
              }
            `.replace(/\W/gm, ''),
			),
		);
	});

	it('should correctly transform the .gitignore file', async () => {
		let externalFileCommands = await transform({
			[gitIgnorePath]: gitIgnoreContent,
		});

		equal(externalFileCommands.length, 2);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === gitIgnorePath &&
					command.data.replace(/\W/gm, '') ===
						`
            build
            dist
            node_modules
            coverage
            `.replace(/\W/gm, ''),
			),
		);
	});
});
