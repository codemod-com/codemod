import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import {
	access,
	copyFile,
	mkdir,
	readdir,
	readFile,
	rmdir,
	stat,
	unlink,
	writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { deflate } from 'node:zlib';
import * as S from '@effect/schema/Schema';
import { globSync } from 'glob';
import * as tar from 'tar';

const promisifiedDeflate = promisify(deflate);

const argumentsSchema = S.array(
	S.union(
		S.struct({
			name: S.string,
			kind: S.literal('string'),
			default: S.optional(S.string),
			description: S.optional(S.string).withDefault(() => ''),
			required: S.optional(S.boolean).withDefault(() => false),
		}),
		S.struct({
			name: S.string,
			kind: S.literal('number'),
			default: S.optional(S.number),
			description: S.optional(S.string).withDefault(() => ''),
			required: S.optional(S.boolean).withDefault(() => false),
		}),
		S.struct({
			name: S.string,
			kind: S.literal('boolean'),
			default: S.optional(S.boolean),
			description: S.optional(S.string).withDefault(() => ''),
			required: S.optional(S.boolean).withDefault(() => false),
		}),
	),
);

const optionalArgumentsSchema = S.optional(argumentsSchema).withDefault(
	() => [],
);

export const PIRANHA_LANGUAGES = [
	'java',
	'kt',
	'go',
	'py',
	'swift',
	'ts',
	'tsx',
	'scala',
] as const;

const piranhaLanguageSchema = S.union(
	...PIRANHA_LANGUAGES.map((language) => S.literal(language)),
);

const codemodConfigSchema = S.union(
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('piranha'),
		language: piranhaLanguageSchema,
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('jscodeshift'),
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('ts-morph'),
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('filemod'),
		arguments: optionalArgumentsSchema,
	}),
	S.struct({
		schemaVersion: S.literal('1.0.0'),
		engine: S.literal('recipe'),
		names: S.array(S.string),
		arguments: optionalArgumentsSchema,
	}),
);

const parseCodemodConfigSchema = S.parseSync(codemodConfigSchema);

const removeDirectoryContents = async (directoryPath: string) => {
	const paths = await readdir(directoryPath);

	for (const path of paths) {
		const absolutePath = join(directoryPath, path);

		const stats = await stat(absolutePath);

		if (!stats.isFile()) {
			await removeDirectoryContents(absolutePath);

			await rmdir(absolutePath);

			continue;
		}

		await unlink(absolutePath);
	}
};

const build = async () => {
	const lastArgument = process.argv.at(-1);

	const buildTarget = lastArgument === '--homedir' ? 'homedir' : 'build';

	const cwd = join(fileURLToPath(new URL('.', import.meta.url)), '../');

	const codemodsDirectoryPath = join(cwd, './codemods');

	const configFilePaths = globSync('./**/config.json', {
		cwd: codemodsDirectoryPath,
		dot: false,
		ignore: ['**/node_modules/**', '**/build/**'],
	});

	const names = configFilePaths.map(dirname);

	// emitting names

	const buildDirectoryPath =
		buildTarget === 'homedir'
			? join(homedir(), '.intuita')
			: join(cwd, './builder/dist');

	await mkdir(buildDirectoryPath, { recursive: true });

	await removeDirectoryContents(buildDirectoryPath);

	// this is a deprecated feature
	await writeFile(
		join(buildDirectoryPath, 'names.json'),
		JSON.stringify(names),
	);

	for (const name of names) {
		const hashDigest = createHash('ripemd160')
			.update(name)
			.digest('base64url');

		const codemodDirectoryPath = join(buildDirectoryPath, hashDigest);

		await mkdir(codemodDirectoryPath, { recursive: true });

		const configPath = join(codemodsDirectoryPath, name, 'config.json');

		const data = await readFile(configPath, { encoding: 'utf8' });

		const config = parseCodemodConfigSchema(JSON.parse(data), {
			onExcessProperty: 'ignore',
		});

		{
			const configWithName = {
				...config,
				name,
			};

			const buildConfigPath = join(codemodDirectoryPath, 'config.json');

			writeFile(buildConfigPath, JSON.stringify(configWithName));
		}

		if (
			config.engine === 'jscodeshift' ||
			config.engine === 'ts-morph' ||
			config.engine === 'filemod'
		) {
			try {
				const indexPath = join(
					codemodsDirectoryPath,
					name,
					'dist',
					'index.cjs',
				);

				await access(indexPath, constants.R_OK);

				const data = await readFile(indexPath);

				{
					const buildIndexPath = join(
						codemodDirectoryPath,
						'index.cjs',
					);

					writeFile(buildIndexPath, data);
				}

				{
					const compressedBuffer = await promisifiedDeflate(data);

					const buildIndexPath = join(
						codemodDirectoryPath,
						'index.cjs.z',
					);

					writeFile(buildIndexPath, compressedBuffer);
				}
			} catch (error) {
				console.error(error);
			}
		} else if (config.engine === 'piranha') {
			const rulesPath = join(codemodsDirectoryPath, name, 'rules.toml');
			const buildRulesPath = join(codemodDirectoryPath, 'rules.toml');

			await copyFile(rulesPath, buildRulesPath);
		} else if (config.engine === 'recipe') {
			// nothing to do
		}

		try {
			const readmePath = join(codemodsDirectoryPath, name, 'README.md');

			const buildDescriptionPath = join(
				codemodDirectoryPath,
				'description.md',
			);

			await access(readmePath, constants.R_OK);

			await copyFile(readmePath, buildDescriptionPath);
		} catch (err) {
			console.error(err);
		}
	}

	if (buildTarget === 'build') {
		await tar.create(
			{
				cwd: buildDirectoryPath,
				portable: true,
				file: join(buildDirectoryPath, 'registry.tar.gz'),
				gzip: true,
				filter: (path) => {
					return !path.endsWith('.z');
				},
			},
			await readdir(buildDirectoryPath),
		);
	}
};

build();
