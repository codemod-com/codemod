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
  ): Promise<{ data: Buffer; cacheUsed: boolean }>;
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
  ): Promise<{ data: Buffer; cacheUsed: boolean }> {
    if (this.cacheEnabled) {
      const localCodemodLastModified =
        await this.__getLocalFileLastModified(path);
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

    const response = await fetch(url);if (!response.ok) throw new Error('Network response was not ok.');const data = await response.arrayBuffer();

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
      response = await fetch(url, { signal: AbortSignal.timeout(15000) })if (!response.ok) throw new Error('Network response was not ok.');;
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
