import type { PrinterBlueprint } from '@codemod-com/printer';
import type { FileSystem } from '@codemod-com/utilities';
import axios, { isAxiosError, type AxiosResponse } from 'axios';

export type FileDownloadServiceBlueprint = Readonly<{
	cacheDisabled: boolean;

	download(
		url: string,
		path: string,
	): Promise<{ data: Buffer; cacheUsed: boolean; cacheReason: string }>;
}>;

export class FileDownloadService implements FileDownloadServiceBlueprint {
	public constructor(
		public readonly cacheDisabled: boolean,
		protected readonly _ifs: FileSystem,
		protected readonly _printer: PrinterBlueprint,
	) {}

	public async download(
		url: string,
		path: string,
	): Promise<{ data: Buffer; cacheUsed: boolean; cacheReason: string }> {
		let cacheReason = 'Cache was disabled manually';

		if (!this.cacheDisabled) {
			let localCodemodLastModified =
				await this.__getLocalFileLastModified(path);
			let remoteCodemodLastModified =
				await this.__getRemoteFileLastModified(url);

			if (localCodemodLastModified === null) {
				cacheReason = 'Local codemod was not found';
			} else if (remoteCodemodLastModified === null) {
				cacheReason = 'Codemod required access permissions';
			} else if (
				// read from cache only if there is no newer remote file
				localCodemodLastModified > remoteCodemodLastModified
			) {
				let tDataOut = await this._ifs.promises.readFile(path);

				return {
					data: Buffer.from(tDataOut),
					cacheUsed: true,
					cacheReason: 'Cache was enabled',
				};
			}
		}

		let { data } = await axios.get(url, {
			responseType: 'arraybuffer',
		});

		let buffer = Buffer.from(data);

		await this._ifs.promises.writeFile(path, buffer);

		return { data: buffer, cacheUsed: false, cacheReason };
	}

	private async __getLocalFileLastModified(
		path: string,
	): Promise<number | null> {
		try {
			let stats = await this._ifs.promises.stat(path);
			return stats.mtime.getTime();
		} catch (e) {
			return null;
		}
	}
	private async __getRemoteFileLastModified(
		url: string,
	): Promise<number | null> {
		let response: AxiosResponse;

		try {
			response = await axios.head(url, {
				timeout: 15000,
			});
		} catch (error) {
			if (!isAxiosError(error)) {
				throw error;
			}

			let status = error.response?.status;

			if (status === 403) {
				return null;
			}

			return null;
		}

		let lastModified = response.headers['last-modified'];

		return lastModified ? Date.parse(lastModified) : null;
	}
}
