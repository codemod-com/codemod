import type { Mode } from "node:fs";
import { chmod } from "node:fs/promises";
import { type FileSystem, FileSystemError, type Uri } from "vscode";

export class FileSystemUtilities {
	readonly #fs: FileSystem;
	constructor(fs: FileSystem) {
		this.#fs = fs;
	}

	public async getModificationTime(uri: Uri): Promise<number> {
		try {
			const fileStat = await this.#fs.stat(uri);

			return fileStat.mtime;
		} catch (error) {
			if (error instanceof FileSystemError) {
				return 0;
			}

			throw error;
		}
	}

	public async setChmod(uri: Uri, mode: Mode): Promise<void> {
		if (uri.scheme !== "file" && uri.scheme !== "vscode-userdata") {
			console.warn("Cannot set chmod for a non-file URI", uri);

			return;
		}

		// the VSCode file system does not support chmod
		return chmod(uri.fsPath, mode);
	}
}
