import fs, { promises as fsPromises } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CodemodMetadata } from '../jobs/runCodemod';
import { parseGithubRepoUrl } from '../util';

export let RESOURCES_FOLDER = 'resources';
export let REPOS_FOLDER = 'repos';
export let SOURCES_FOLDER = 'sources';

export class FileSystemCreateFoldersError extends Error {}
export class FileSystemCreateDirectoryError extends Error {}
export class FileSystemWriteIntoFileError extends Error {}
export class FileSystemDeleteFileError extends Error {}
export class FileSystemDeleteDirectoryError extends Error {}
export class FileSystemRemoveFoldersError extends Error {}
export class FileSystemCreateSourceFileError extends Error {}

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

export class FileSystemService {
	private readonly __codemodMetadata: CodemodMetadata;
	private readonly __baseDir: string;
	private readonly __reposFolderPath: string;
	private readonly __sourcesFolderPath: string;

	constructor(codemodMetadata: CodemodMetadata) {
		this.__codemodMetadata = codemodMetadata;
		this.__baseDir = path.resolve(__dirname, `../${RESOURCES_FOLDER}`);
		this.__sourcesFolderPath = path.join(this.__baseDir, SOURCES_FOLDER);
		this.__reposFolderPath = path.join(this.__baseDir, REPOS_FOLDER);
	}

	public get sourcePath(): string {
		let { jobId, codemodName } = this.__codemodMetadata;

		return path.resolve(
			__dirname,
			`${this.__sourcesFolderPath}/${jobId}-${codemodName}/${codemodName}.cjs`,
		);
	}

	public get targetPath(): string {
		let { jobId, codemodName, repoUrl } = this.__codemodMetadata;
		let { repoName } = parseGithubRepoUrl(repoUrl);

		return path.resolve(
			__dirname,
			`${this.__reposFolderPath}/${jobId}-${codemodName}/${repoName}`,
		);
	}

	public async createFolders(): Promise<void> {
		try {
			let { jobId, codemodName } = this.__codemodMetadata;

			await this.__createDirectory(this.__sourcesFolderPath);
			await this.__createDirectory(this.__reposFolderPath);

			let repoPath = path.join(
				this.__sourcesFolderPath,
				`${jobId}-${codemodName}`,
			);
			await this.__createDirectory(repoPath);

			let sourcePath = path.join(
				this.__sourcesFolderPath,
				`${jobId}-${codemodName}`,
			);
			await this.__createDirectory(sourcePath);
		} catch (error) {
			let { message } = error as Error;

			throw new FileSystemCreateFoldersError(
				`Cannot create folders! Reason: ${message}`,
			);
		}
	}

	public async createSourceFile(): Promise<void> {
		try {
			let { codemodSource } = this.__codemodMetadata;

			await this.__writeFile(this.sourcePath, codemodSource);
		} catch (error) {
			let { message } = error as Error;

			throw new FileSystemCreateSourceFileError(
				`Cannot create source file! Reason: ${message}`,
			);
		}
	}

	public async deleteFolders(): Promise<void> {
		try {
			let { jobId, codemodName } = this.__codemodMetadata;

			let repoPath = path.join(
				this.__reposFolderPath,
				`${jobId}-${codemodName}`,
			);
			await this.__deleteDirectory(repoPath);

			let sourcePath = path.join(
				this.__sourcesFolderPath,
				`${jobId}-${codemodName}`,
			);
			await this.__deleteDirectory(sourcePath);
		} catch (error) {
			let { message } = error as Error;

			throw new FileSystemRemoveFoldersError(
				`Cannot remove folders! Reason: ${message}`,
			);
		}
	}

	private async __createDirectory(path: string): Promise<void> {
		try {
			if (!fs.existsSync(path)) {
				await fsPromises.mkdir(path, { recursive: true });
			}
		} catch (error) {
			let { message } = error as Error;

			throw new FileSystemCreateDirectoryError(
				`Cannot create directory! Reason: ${message}`,
			);
		}
	}

	private async __writeFile(path: string, content: string): Promise<void> {
		try {
			await fsPromises.writeFile(path, content, 'utf8');
		} catch (error) {
			let { message } = error as Error;

			throw new FileSystemWriteIntoFileError(
				`Cannot write into file! Reason: ${message}`,
			);
		}
	}

	private async __deleteFile(path: string): Promise<void> {
		try {
			await fsPromises.unlink(path);
		} catch (error) {
			let { message } = error as Error;

			throw new FileSystemDeleteFileError(
				`Cannot delete this file from path! Reason: ${message}`,
			);
		}
	}

	private async __deleteDirectory(path: string): Promise<void> {
		try {
			await fsPromises.rm(path, { recursive: true });
		} catch (error) {
			let { message } = error as Error;

			throw new FileSystemDeleteDirectoryError(
				`Cannot delete this directory from path! Reason: ${message}`,
			);
		}
	}
}
