import { parse } from "node:path";
import type { IFs } from "memfs";
import type { TDataOut } from "memfs/lib/encoding.js";
import { PrinterBlueprint } from "./printer.js";
import { colorizeText } from "./utils.js";

const CACHE_EVICTION_THRESHOLD = 24 * 60 * 60 * 1000;

const toBuffer = (tDataOut: TDataOut): Buffer => {
	if (typeof tDataOut === "string") {
		return Buffer.from(tDataOut);
	}
	return tDataOut;
};

export type FileDownloadServiceBlueprint = Readonly<{
	download(url: string, path: string): Promise<Buffer>;
}>;

export class FileDownloadService implements FileDownloadServiceBlueprint {
	public constructor(
		protected readonly _disableCache: boolean,
		protected readonly _fetchBuffer: (url: string) => Promise<Buffer>,
		protected readonly _getNow: () => number,
		protected readonly _ifs: IFs,
		protected readonly _printer: PrinterBlueprint,
	) {}

	public async download(url: string, path: string): Promise<Buffer> {
		if (!this._disableCache) {
			try {
				const stats = await this._ifs.promises.stat(path);

				const mtime = stats.mtime.getTime();

				const now = this._getNow();

				if (now - mtime < CACHE_EVICTION_THRESHOLD) {
					const parsedS3Url = parse(url);
					this._printer.printConsoleMessage(
						"info",
						colorizeText(
							`Loading the cached content of "${parsedS3Url.name}${parsedS3Url.ext}"...`,
							"cyan",
						),
					);

					const tDataOut = await this._ifs.promises.readFile(path);

					return toBuffer(tDataOut);
				}
			} catch (error) {
				/* empty */
			}
		}

		const buffer = await this._fetchBuffer(url);

		await this._ifs.promises.writeFile(path, buffer);

		return buffer;
	}
}
