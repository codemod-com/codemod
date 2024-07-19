import type { Printer } from "@codemod-com/printer";
import type { FileSystem } from "@codemod-com/utilities";
import axios, { isAxiosError, type AxiosResponse } from "axios";

export class FileDownloadService {
  public constructor(
    public cacheEnabled: boolean,
    public readonly _ifs: FileSystem,
    public readonly _printer: Printer,
  ) {}

  public async download(options: {
    url: string;
    path: string;
    cachePingPath?: string;
  }): Promise<{ data: Buffer; cacheUsed: boolean }> {
    const { url, path, cachePingPath = path } = options;

    if (this.cacheEnabled) {
      const localCodemodLastModified =
        await this.__getLocalFileLastModified(cachePingPath);
      const remoteCodemodLastModified =
        await this.__getRemoteFileLastModified(url);

      if (
        localCodemodLastModified !== null &&
        remoteCodemodLastModified !== null
      ) {
        const tDataOut = await this._ifs.promises.readFile(path);

        return {
          data: Buffer.from(tDataOut),
          cacheUsed: true,
        };
      }
    }

    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(data);

    await this._ifs.promises.writeFile(path, buffer);

    return { data: buffer, cacheUsed: false };
  }

  private async __getLocalFileLastModified(
    path: string,
  ): Promise<number | null> {
    try {
      const stats = await this._ifs.promises.stat(path);
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

      const status = error.response?.status;

      if (status === 403) {
        return null;
      }

      return null;
    }

    const lastModified = response.headers["last-modified"];

    return lastModified ? Date.parse(lastModified) : null;
  }
}
