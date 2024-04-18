import { Axios } from "axios";
import type { IFs } from "memfs";
import type { PrinterBlueprint } from "./printer.js";

const CACHE_EVICTION_THRESHOLD = 24 * 60 * 60 * 1000;

export type FileDownloadServiceBlueprint = Readonly<{
	download(url: string, path: string): Promise<Buffer>;
}>;

const fetchBuffer = async (url: string) => {
	const { data } = await Axios.get(url, {
		responseType: "arraybuffer",
	});

	return Buffer.from(data);
};

export class FileDownloadService implements FileDownloadServiceBlueprint {
	public constructor(
		protected readonly _disableCache: boolean,
		protected readonly _ifs: IFs | typeof import("fs"),
		protected readonly _printer: PrinterBlueprint,
	) {}

	public async download(url: string, path: string): Promise<Buffer> {
		if (!this._disableCache) {
			try {
				const stats = await this._ifs.promises.stat(path);

				const mtime = stats.mtime.getTime();

				const now = Date.now();

				if (now - mtime < CACHE_EVICTION_THRESHOLD) {
					const tDataOut = await this._ifs.promises.readFile(path);

					return Buffer.from(tDataOut);
				}
			} catch (error) {
				/* empty */
			}
		}

		const buffer = await fetchBuffer(url);

		await this._ifs.promises.writeFile(path, buffer);

		return buffer;
	}
}
