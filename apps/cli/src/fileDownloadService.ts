import type { PrinterBlueprint } from "@codemod-com/printer";
import type { FileSystem } from "@codemod-com/utilities";
import axios from "axios";

const CACHE_EVICTION_THRESHOLD = 24 * 60 * 60 * 1000;

export type FileDownloadServiceBlueprint = Readonly<{
  download(url: string, path: string): Promise<Buffer>;
}>;

export class FileDownloadService implements FileDownloadServiceBlueprint {
  public constructor(
    protected readonly _disableCache: boolean,
    protected readonly _ifs: FileSystem,
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

    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(data);

    await this._ifs.promises.writeFile(path, buffer);

    return buffer;
  }
}
