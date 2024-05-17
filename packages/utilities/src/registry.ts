import { createHash } from 'node:crypto';
import { basename, dirname, join } from 'node:path';
import type {
	GlobArguments,
	PathAPI,
	PathHashDigest,
	UnifiedEntry,
} from '@codemod-com/filemod';
import { UnifiedFileSystem } from '@codemod-com/filemod';
import glob, { type FileSystemAdapter } from 'fast-glob';
import type { API } from 'jscodeshift';
import jscodeshift from 'jscodeshift';
import type { IFs } from 'memfs';

export let buildApi = (parser: string | undefined): API => ({
	j: parser ? jscodeshift.withParser(parser) : jscodeshift,
	jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
	stats: () => {
		console.error(
			'The stats function was called, which is not supported on purpose',
		);
	},
	report: () => {
		console.error(
			'The report function was called, which is not supported on purpose',
		);
	},
});

export let buildPathHashDigest = (path: string) =>
	createHash('ripemd160').update(path).digest('base64url') as PathHashDigest;

export let getUnifiedEntry =
	(fileSystem: IFs) =>
	async (path: string): Promise<UnifiedEntry> => {
		let stat = await fileSystem.promises.stat(path);

		if (stat.isDirectory()) {
			return {
				kind: 'directory',
				path,
			};
		}

		if (stat.isFile()) {
			return {
				kind: 'file',
				path,
			};
		}

		throw new Error(`The entry ${path} is neither a directory nor a file`);
	};

export let buildGlobWrapper =
	(fileSystem: IFs) => (globArguments: GlobArguments) => {
		return glob(globArguments.includePatterns.slice(), {
			absolute: true,
			cwd: globArguments.currentWorkingDirectory,
			ignore: globArguments.excludePatterns.slice(),
			fs: fileSystem as Partial<FileSystemAdapter>,
			onlyFiles: true,
		});
	};

export let buildReadDirectory =
	(fileSystem: IFs) =>
	async (path: string): Promise<ReadonlyArray<UnifiedEntry>> => {
		let entries = await fileSystem.promises.readdir(path, {
			withFileTypes: true,
		});

		return entries.map((entry) => {
			if (typeof entry === 'string' || !('isDirectory' in entry)) {
				throw new Error('Entry can neither be a string or a Buffer');
			}

			if (entry.isDirectory()) {
				return {
					kind: 'directory' as const,
					path: join(path, entry.name.toString()),
				};
			}

			if (entry.isFile()) {
				return {
					kind: 'file' as const,
					path: join(path, entry.name.toString()),
				};
			}

			throw new Error('The entry is neither directory not file');
		});
	};

export let buildReadFile =
	(fileSystem: IFs) =>
	async (path: string): Promise<string> => {
		let data = await fileSystem.promises.readFile(path, {
			encoding: 'utf8',
		});

		return data.toString();
	};

export let buildUnifiedFileSystem = (fileSystem: IFs) =>
	new UnifiedFileSystem(
		buildPathHashDigest,
		getUnifiedEntry(fileSystem),
		buildGlobWrapper(fileSystem),
		buildReadDirectory(fileSystem),
		buildReadFile(fileSystem),
	);

export let buildPathAPI = (currentWorkingDirectory: string): PathAPI => ({
	getDirname: (path) => dirname(path),
	getBasename: (path) => basename(path),
	joinPaths: (...paths) => join(...paths),
	currentWorkingDirectory,
});

export let trimLicense = (testFixture: string): string => {
	return testFixture.replace(/\/\*[\s\S]*?\*\//gm, '');
};
