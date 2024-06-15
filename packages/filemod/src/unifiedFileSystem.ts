import type { ExternalFileCommand } from './externalFileCommands.js';
import { LeftRightHashSetManager } from './leftRightHashSetManager.js';

export interface UnifiedFile {
	readonly kind: 'file';
	readonly path: string;
}

export interface UnifiedDirectory {
	readonly kind: 'directory';
	readonly path: string;
}

export type UnifiedEntry = UnifiedFile | UnifiedDirectory;

export type PathHashDigest = string & {
	__PathHashDigest: '__PathHashDigest';
};

export interface GlobArguments {
	readonly includePatterns: ReadonlyArray<string>;
	readonly excludePatterns: ReadonlyArray<string>;
	readonly currentWorkingDirectory: string;
}

export class UnifiedFileSystem {
	private __directoryFiles = new LeftRightHashSetManager<
		PathHashDigest,
		PathHashDigest
	>(new Set());
	private __entries = new Map<PathHashDigest, UnifiedEntry>();
	private __changes = new Map<PathHashDigest, string | null>();

	public constructor(
		private __buildPathHashDigest: (path: string) => PathHashDigest,
		private __getUnifiedEntry: (path: string) => Promise<UnifiedEntry>,
		private __glob: (
			globArguments: GlobArguments,
		) => Promise<ReadonlyArray<string>>,
		private __readDirectory: (
			path: string,
		) => Promise<ReadonlyArray<UnifiedEntry>>,
		private __readFile: (path: string) => Promise<string>,
	) {}

	public async upsertUnifiedEntry(
		path: string,
	): Promise<UnifiedEntry | null> {
		let unifiedDirectory = await this.upsertUnifiedDirectory(path);

		if (unifiedDirectory) {
			return unifiedDirectory;
		}

		return this.upsertUnifiedFile(path);
	}

	public async upsertUnifiedDirectory(
		directoryPath: string,
	): Promise<UnifiedEntry | null> {
		let directoryPathHashDigest = this.__buildPathHashDigest(directoryPath);

		if (!this.__entries.has(directoryPathHashDigest)) {
			let unifiedEntry = await this.__getUnifiedEntry(directoryPath);

			if (unifiedEntry.kind !== 'directory') {
				return null;
			}

			this.__entries.set(directoryPathHashDigest, unifiedEntry);

			return unifiedEntry;
		}

		return this.__entries.get(directoryPathHashDigest) ?? null;
	}

	public async upsertUnifiedFile(
		filePath: string,
	): Promise<UnifiedEntry | null> {
		let filePathHashDigest = this.__buildPathHashDigest(filePath);

		if (!this.__entries.has(filePathHashDigest)) {
			let unifiedEntry = await this.__getUnifiedEntry(filePath);

			if (unifiedEntry.kind !== 'file') {
				return null;
			}

			this.__entries.set(filePathHashDigest, unifiedEntry);

			return unifiedEntry;
		}

		return this.__entries.get(filePathHashDigest) ?? null;
	}

	public async readDirectory(
		directoryPath: string,
	): Promise<readonly string[]> {
		let directoryPathHashDigest = this.__buildPathHashDigest(directoryPath);

		let unifiedEntries = await this.__readDirectory(directoryPath);

		unifiedEntries.forEach((unifiedEntry) => {
			let pathHashDigest = this.__buildPathHashDigest(unifiedEntry.path);

			if (unifiedEntry.kind === 'directory') {
				// directory was deleted (or moved), remove its hash
				if (this.__changes.get(pathHashDigest) === null) {
					this.__directoryFiles.delete(
						directoryPathHashDigest,
						pathHashDigest,
					);

					return;
				}

				this.__directoryFiles.upsert(
					directoryPathHashDigest,
					pathHashDigest,
				);
				this.__entries.set(pathHashDigest, unifiedEntry);
			}

			if (unifiedEntry.kind === 'file') {
				//  file was deleted (or moved), remove its hash

				if (this.__changes.get(pathHashDigest) === null) {
					this.__directoryFiles.delete(
						directoryPathHashDigest,
						pathHashDigest,
					);

					return;
				}

				this.__directoryFiles.upsert(
					directoryPathHashDigest,
					pathHashDigest,
				);
				this.__entries.set(pathHashDigest, unifiedEntry);
			}
		});

		let paths: string[] = [];

		this.__directoryFiles
			.getRightHashesByLeftHash(directoryPathHashDigest)
			.forEach((pathHashDigest) => {
				let unifiedEntry = this.__entries.get(pathHashDigest);

				if (unifiedEntry !== undefined) {
					paths.push(unifiedEntry.path);
				}
			});

		return paths;
	}

	public async readFile(path: string): Promise<string> {
		let pathHashDigest = this.__buildPathHashDigest(path);

		let upsertedData = this.__changes.get(pathHashDigest);

		if (upsertedData === undefined) {
			try {
				return await this.__readFile(path);
			} catch (error) {
				return '';
			}
		}

		if (upsertedData === null) {
			throw new Error('This file has already been deleted');
		}

		return upsertedData;
	}

	public isDirectory(directoryPath: string): boolean {
		let directoryPathHashDigest = this.__buildPathHashDigest(directoryPath);

		return (
			this.__entries.get(directoryPathHashDigest)?.kind === 'directory'
		);
	}

	public exists(directoryPath: string): boolean {
		let directoryPathHashDigest = this.__buildPathHashDigest(directoryPath);

		return this.__entries.has(directoryPathHashDigest);
	}

	public async getFilePaths(
		directoryPath: string,
		includePatterns: readonly string[],
		excludePatterns: readonly string[],
	): Promise<readonly string[]> {
		let paths = (
			await this.__glob({
				includePatterns,
				excludePatterns,
				currentWorkingDirectory: directoryPath,
			})
		)
			// fast-glob has hardcoded separator pathSegmentSeparator: '/', so for windows platform we need to replace backslashes to forwardslashes
			// side-note, we are not using fast-glob anymore, so maybe this is redundant?
			.map((path) =>
				process.platform === 'win32' ? path.replace(/\//g, '\\') : path,
			);

		paths.forEach((path) => {
			let unifiedFile: UnifiedFile = {
				kind: 'file',
				path,
			};

			let pathHashDigest = this.__buildPathHashDigest(path);

			this.__entries.set(pathHashDigest, unifiedFile);
		});

		return paths;
	}

	public deleteFile(filePath: string): void {
		let pathHashDigest = this.__buildPathHashDigest(filePath);

		let unifiedFile: UnifiedFile = {
			kind: 'file',
			path: filePath,
		};

		this.__entries.set(pathHashDigest, unifiedFile);
		this.__changes.set(pathHashDigest, null);
	}

	public async moveFile(
		oldFilePath: string,
		newFilePath: string,
	): Promise<void> {
		let oldPathHashDigest = this.__buildPathHashDigest(oldFilePath);

		let unifiedFile = this.__entries.get(oldPathHashDigest);

		if (unifiedFile === undefined) {
			throw new Error(`File ${oldFilePath} not found`);
		}

		let oldFileContent = await this.readFile(oldFilePath);

		if (typeof oldFileContent !== 'string') {
			throw new Error(`File ${oldFileContent} was deleted`);
		}

		this.__changes.set(oldPathHashDigest, null);

		this.upsertData(newFilePath, oldFileContent);
	}

	public upsertData(filePath: string, data: string): void {
		let pathHashDigest = this.__buildPathHashDigest(filePath);

		let unifiedFile: UnifiedFile = {
			kind: 'file',
			path: filePath,
		};

		this.__entries.set(pathHashDigest, unifiedFile);

		this.__changes.set(pathHashDigest, data);
	}

	public buildExternalFileCommands(): readonly ExternalFileCommand[] {
		let commands: ExternalFileCommand[] = [];

		this.__changes.forEach((data, hashDigest) => {
			let entry = this.__entries.get(hashDigest);

			if (entry && data === null) {
				commands.push({
					kind: 'deleteFile',
					path: entry.path,
				});
			}

			if (entry && data !== null) {
				commands.push({
					kind: 'upsertFile',
					path: entry.path,
					data,
				});
			}
		});

		return commands;
	}
}
