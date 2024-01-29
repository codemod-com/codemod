import { IFs } from 'memfs';
import * as S from '@effect/schema/Schema';
import path from 'node:path';
import {
	Codemod,
	JavaScriptCodemodEngine,
	javaScriptCodemodEngineSchema,
} from './codemod.js';
import { CodemodSettings } from './schemata/codemodSettingsSchema.js';

const extractMainScriptRelativePath = async (
	fs: IFs,
	filePath: string,
): Promise<string | null> => {
	try {
		const data = await fs.promises.readFile(filePath, {
			encoding: 'utf-8',
		});

		const schema = S.struct({
			main: S.string,
		});

		const { main } = S.parseSync(schema)(JSON.parse(data.toString()));

		return main;
	} catch {
		return null;
	}
};

const extractEngine = async (
	fs: IFs,
	filePath: string,
): Promise<JavaScriptCodemodEngine | null> => {
	try {
		const data = await fs.promises.readFile(filePath, {
			encoding: 'utf-8',
		});

		const schema = S.struct({
			engine: javaScriptCodemodEngineSchema,
		});

		const { engine } = S.parseSync(schema)(JSON.parse(data.toString()));

		return engine;
	} catch {
		return null;
	}
};

export const buildSourcedCodemodOptions = async (
	fs: IFs,
	codemodOptions: CodemodSettings & { kind: 'runSourced' },
): Promise<Codemod & { source: 'fileSystem' }> => {
	const isDirectorySource = await fs.promises
		.lstat(codemodOptions.sourcePath)
		.then((pathStat) => pathStat.isDirectory());

	if (!isDirectorySource) {
		if (codemodOptions.codemodEngine === null) {
			throw new Error(
				'--codemodEngine has to be defined when running local codemod',
			);
		}

		return {
			source: 'fileSystem' as const,
			engine: codemodOptions.codemodEngine,
			indexPath: codemodOptions.sourcePath,
		};
	}

	if (
		!['config.json', 'package.json']
			.map((lookedupFilePath) =>
				path.join(codemodOptions.sourcePath, lookedupFilePath),
			)
			.every(fs.existsSync)
	) {
		throw new Error(
			`Codemod directory is of incorrect structure at ${codemodOptions.sourcePath}`,
		);
	}

	const mainScriptRelativePath = await extractMainScriptRelativePath(
		fs,
		path.join(codemodOptions.sourcePath, 'package.json'),
	);

	if (!mainScriptRelativePath) {
		throw new Error(
			`No main script specified for codemod at ${codemodOptions.sourcePath}`,
		);
	}

	const mainScriptPath = path.join(
		codemodOptions.sourcePath,
		mainScriptRelativePath,
	);

	const engine = await extractEngine(
		fs,
		path.join(codemodOptions.sourcePath, 'config.json'),
	);

	if (engine === null) {
		throw new Error(
			`Engine specified in config.json at ${codemodOptions.sourcePath} is not a JavaScript codemod engine or does not exist.`,
		);
	}

	return {
		source: 'fileSystem' as const,
		engine,
		indexPath: mainScriptPath,
	};
};
