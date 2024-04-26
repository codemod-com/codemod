import type { PrinterBlueprint } from "@codemod-com/printer";
import type { FileSystem } from "@codemod-com/utilities";
import axios, { isAxiosError, type AxiosResponse } from "axios";

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
      const localCodemodLastModified =
        await this.__getLocalFileLastModified(path);
      const remoteCodemodLastModified =
        await this.__getRemoteFileLastModified(url);

      // read from cache only if there is no newer remote file
      if (
        remoteCodemodLastModified !== null &&
        localCodemodLastModified > remoteCodemodLastModified
      ) {
        const tDataOut = await this._ifs.promises.readFile(path);

        return Buffer.from(tDataOut);
      }
    }

    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(data);

    await this._ifs.promises.writeFile(path, buffer);

    return buffer;
  }

  async __getLocalFileLastModified(path: string): Promise<number> {
    const stats = await this._ifs.promises.stat(path);
    return stats.mtime.getTime();
  }
  async __getRemoteFileLastModified(url: string): Promise<number | null> {
    let response: AxiosResponse;

    try {
      response = await axios.head(url, {
        timeout: 15000,
      });
    } catch (error) {
      if (!isAxiosError(error)) {
        throw error;
      }

      const status = error.response?.status;

      if (status === 403) {
        throw new Error(
          `Could not make a request to ${url}: request forbidden`,
        );
      }

      throw new Error(`Could not make a request to ${url}`);
    }

    const lastModified = response.headers["last-modified"];

    return lastModified ? Date.parse(lastModified) : null;
  }
}
