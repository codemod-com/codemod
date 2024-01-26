import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import jsYaml from 'js-yaml';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { buildConfigJsonData } from './buildConfigJsonData.js';
import { buildIndexDtsData } from './buildIndexDtsData.js';
import { buildMochaRcJsonData } from './buildMochaRcJsonData.js';
import { buildPackageJsonData } from './buildPackageJsonData.js';
import { buildSrcIndexTsData } from './buildSrcIndexTsData.js';
import { buildTestTestTsData } from './buildTestTestTsData.js';
import { buildTsconfigJsonData } from './buildTsconfigJsonData.js';
import type { PnpmWorkspace } from './schema.js';
import { parseArgv, parsePnpmWorkspaceSchema } from './schema.js';

const main = async () => {
	const slicedArgv = hideBin(process.argv);

	const argvObject = yargs(slicedArgv)
		.scriptName('create')
		.command('* <name>', 'creates a codemod', (y) =>
			y.option('engine', {
				type: 'string',
				description: 'Select the codemod engine',
				default: 'jscodeshift',
			}),
		)
		.help();

	if (slicedArgv.length === 0) {
		argvObject.showHelp();
		return;
	}

	const argv = parseArgv(await Promise.resolve(argvObject.argv));

	const cwd = process.cwd();

	const workspace = `./${join(
		'codemods',
		...argv.name.split(sep).slice(0, -1),
		'*',
	)}`;

	const codemodDirectoryPath = join(cwd, '../codemods', argv.name);

	{
		await mkdir(codemodDirectoryPath, { recursive: true });
	}

	{
		const data = buildPackageJsonData(argv);

		await writeFile(join(codemodDirectoryPath, 'package.json'), data);
	}

	{
		const data = buildIndexDtsData(argv);

		if (data !== null) {
			await writeFile(join(codemodDirectoryPath, 'index.d.ts'), data);
		}
	}

	{
		const data = buildMochaRcJsonData(argv);

		if (data !== null) {
			await writeFile(join(codemodDirectoryPath, '.mocharc.json'), data);
		}
	}

	{
		const data = buildTsconfigJsonData(argv);

		if (data !== null) {
			await writeFile(join(codemodDirectoryPath, 'tsconfig.json'), data);
		}
	}

	{
		const data = buildSrcIndexTsData(argv);

		if (data !== null) {
			await mkdir(join(codemodDirectoryPath, './src'), {
				recursive: true,
			});

			await writeFile(join(codemodDirectoryPath, './src/index.ts'), data);
		}
	}

	{
		const data = buildTestTestTsData(argv);

		if (data !== null) {
			await mkdir(join(codemodDirectoryPath, './test'), {
				recursive: true,
			});

			await writeFile(join(codemodDirectoryPath, './test/test.ts'), data);
		}
	}

	{
		const data = buildConfigJsonData(argv);

		await writeFile(join(codemodDirectoryPath, './config.json'), data);
	}

	{
		const pnpmWorkspaceYamlPath = join(cwd, '../pnpm-workspace.yaml');
		const buffer = await readFile(pnpmWorkspaceYamlPath);

		const pnpmWorkspace = parsePnpmWorkspaceSchema(
			jsYaml.load(buffer.toString('utf8')),
		);

		if (!pnpmWorkspace.packages.includes(workspace)) {
			const newPnpmWorkspace: PnpmWorkspace = {
				packages: pnpmWorkspace.packages.concat([workspace]),
			};

			const data = jsYaml.dump(newPnpmWorkspace);

			await writeFile(pnpmWorkspaceYamlPath, data);
		}
	}
};

main();
