import type { PrinterBlueprint } from "@codemod-com/printer";
import type { FileSystem } from "@codemod-com/utilities";
import axios, { isAxiosError, type AxiosResponse } from "axios";

export type FileDownloadServiceBlueprint = Readonly<{
  cacheEnabled: boolean;
  readonly _ifs: FileSystem;
  readonly _printer: PrinterBlueprint;

  download(
    url: string,
    path: string,
  ): Promise<{ data: Buffer; cacheUsed: boolean; cacheReason: string }>;
}>;

export class FileDownloadService implements FileDownloadServiceBlueprint {
  public constructor(
    public cacheEnabled: boolean,
    public readonly _ifs: FileSystem,
    public readonly _printer: PrinterBlueprint,
  ) {}

  public async download(
    url: string,
    path: string,
  ): Promise<{ data: Buffer; cacheUsed: boolean; cacheReason: string }> {
    let cacheReason = "cache was disabled manually";

    if (this.cacheEnabled) {
      const localCodemodLastModified =
        await this.__getLocalFileLastModified(path);
      const remoteCodemodLastModified =
        await this.__getRemoteFileLastModified(url);

      if (localCodemodLastModified === null) {
        cacheReason = "local codemod was not found";
      } else if (remoteCodemodLastModified === null) {
        cacheReason = "codemod required access permissions";
      } else {
        const tDataOut = await this._ifs.promises.readFile(path);

        return {
          data: Buffer.from(tDataOut),
          cacheUsed: true,
          cacheReason: "cache was enabled",
        };
      }
    }

    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(data);

    await this._ifs.promises.writeFile(path, buffer);

    return { data: buffer, cacheUsed: false, cacheReason };
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
