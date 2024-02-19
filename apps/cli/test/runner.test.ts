import { equal } from 'node:assert';
import { randomBytes } from 'node:crypto';
import { createFsFromVolume, Volume } from 'memfs';
import { describe, it } from 'vitest';
import { CodemodDownloaderBlueprint } from '../src/downloadCodemod.js';
import { PrinterBlueprint } from '../src/printer.js';
import { RepositoryConfiguration } from '../src/repositoryConfiguration.js';
import { Runner } from '../src/runner.js';
import { CodemodSettings } from '../src/schemata/codemodSettingsSchema.js';
import { FlowSettings } from '../src/schemata/flowSettingsSchema.js';
import { RunSettings } from '../src/schemata/runArgvSettingsSchema.js';

const CODEMOD_D_INDEX_TS = `
export default function transform(file, api, options) {
	return \`"transformed \${file.path} \${options.argA} \${options.argB}"\`;
}
`;

const CODEMOD_E_INDEX_TS = `
export default function transform(file, api, options) {
	if (file.path === '/code/c.ts') {
		return \`"double transformed \${file.path} \${options.argA} \${options.argB}"\`;
	}
	return undefined;
}
`;

describe('Runner', function () {
	it('should transform staged files using the pre-commit codemods', async () => {
		const volume = Volume.fromJSON({
			'/code/a.ts': 'unchanged',
			'/code/b.ts': 'unchanged',
			'/code/c.ts': 'unchanged',
			'/code/e.ts': 'unchanged',
			'/codemods/d/index.ts': CODEMOD_D_INDEX_TS,
			'/codemods/e/index.ts': CODEMOD_E_INDEX_TS,
		});

		const ifs = createFsFromVolume(volume);
		const printer: PrinterBlueprint = {
			printMessage: () => {},
			printOperationMessage: () => {},
			printConsoleMessage: () => {},
		};

		const codemodDownloader: CodemodDownloaderBlueprint = {
			syncRegistry: async () => {},
			download: async (name: string) => {
				return {
					source: 'registry',
					name,
					engine: 'jscodeshift',
					indexPath: `/codemods/${name}/index.ts`,
					directoryPath: `/codemods/${name}`,
					arguments: [
						{
							name: 'argA',
							kind: 'number',
						},
						{
							name: 'argB',
							kind: 'number',
						},
					],
				};
			},
		};

		const loadRepositoryConfiguration = () =>
			Promise.resolve<RepositoryConfiguration>({
				schemaVersion: '1.0.0',
				preCommitCodemods: [
					{
						source: 'registry',
						name: 'd',
						arguments: {
							argA: 1,
							argB: 2,
						},
					},
					{
						source: 'registry',
						name: 'e',
						arguments: {
							argA: 3,
							argB: 4,
						},
					},
				],
			});

		const codemodSettings: CodemodSettings = {
			kind: 'runOnPreCommit',
		};

		const flowSettings: FlowSettings = {
			include: [],
			exclude: [],
			target: '/code',
			files: ['/code/a.ts', '/code/b.ts', '/code/c.ts'],
			limit: 3,
			prettier: false,
			'no-cache': false,
			noCache: false,
			json: true,
			threads: 1,
		};

		const currentWorkingDirectory = '/';

		const getCodemodSource = async (path: string) => {
			const data = await ifs.promises.readFile(path);

			if (typeof data === 'string') {
				return data;
			}

			return data.toString('utf8');
		};

		const runSettings: RunSettings = {
			dryRun: false,
			caseHashDigest: randomBytes(20),
		};

		const runner = new Runner(
			ifs,
			printer,
			{
				sendEvent: () => {},
			},
			codemodDownloader,
			loadRepositoryConfiguration,
			codemodSettings,
			flowSettings,
			runSettings,
			{},
			null,
			currentWorkingDirectory,
			getCodemodSource,
		);

		await runner.run();

		equal(
			(await volume.promises.readFile('/code/a.ts')).toString(),
			'"transformed /code/a.ts 1 2"',
		);

		equal(
			(await volume.promises.readFile('/code/b.ts')).toString(),
			'"transformed /code/b.ts 1 2"',
		);

		equal(
			(await volume.promises.readFile('/code/c.ts')).toString(),
			'"double transformed /code/c.ts 3 4"',
		);

		equal(
			(await volume.promises.readFile('/code/e.ts')).toString(),
			'unchanged',
		);
	});
});
