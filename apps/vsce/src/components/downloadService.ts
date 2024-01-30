import { Mode } from 'node:fs';
import axios from 'axios';
import { FileSystem, Uri } from 'vscode';
import { FileSystemUtilities } from './fileSystemUtilities';

export class RequestError extends Error {}
export class ForbiddenRequestError extends Error {}

export class DownloadService {
	#fileSystem: FileSystem;
	#fileSystemUtilities: FileSystemUtilities;

	constructor(
		fileSystem: FileSystem,
		fileSystemUtilities: FileSystemUtilities,
	) {
		this.#fileSystem = fileSystem;
		this.#fileSystemUtilities = fileSystemUtilities;
	}

	async downloadFileIfNeeded(
		url: string,
		uri: Uri,
		chmod: Mode | null,
	): Promise<boolean> {
		const localModificationTime =
			await this.#fileSystemUtilities.getModificationTime(uri);

		let response;

		try {
			response = await axios.head(url, { timeout: 5000 });
		} catch (error) {
			if (localModificationTime > 0) {
				return false;
			}

			if (!axios.isAxiosError(error)) {
				throw error;
			}

			const status = error.response?.status;

			if (status === 403) {
				throw new ForbiddenRequestError(
					`Could not make a request to ${url}: request forbidden`,
				);
			}

			throw new RequestError(`Could not make a request to ${url}`);
		}

		const lastModified = response?.headers['last-modified'] ?? null;
		const remoteModificationTime = lastModified
			? Date.parse(lastModified)
			: localModificationTime;

		if (localModificationTime < remoteModificationTime) {
			await this.#downloadFile(url, uri, chmod);

			return true;
		}

		return false;
	}

	async #downloadFile(
		url: string,
		uri: Uri,
		chmod: Mode | null,
	): Promise<void> {
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		const content = new Uint8Array(response.data);

		await this.#fileSystem.writeFile(uri, content);

		if (chmod !== null) {
			await this.#fileSystemUtilities.setChmod(uri, chmod);
		}
	}
}
