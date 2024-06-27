import type { Mode } from "node:fs";
import { isFetchError } from "@codemod-com/utilities";
import type { FileSystem, Uri } from "vscode";
import { DEFAULT_RETRY_COUNT, retryingClient } from "../fetch";
import type { FileSystemUtilities } from "./fileSystemUtilities";

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

    let response: Response | undefined;

    try {
      response = await retryingClient(url, {
        method: "HEAD",
        retries: DEFAULT_RETRY_COUNT,
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      if (localModificationTime > 0) {
        return false;
      }

      if (!isFetchError(error)) {
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

    const lastModified = response?.headers.get("last-modified") ?? null;
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
    const response = await retryingClient(url, {
      retries: DEFAULT_RETRY_COUNT,
      signal: AbortSignal.timeout(15000),
    });
    const content = new Uint8Array(await response.arrayBuffer());

    await this.#fileSystem.writeFile(uri, content);

    if (chmod !== null) {
      await this.#fileSystemUtilities.setChmod(uri, chmod);
    }
  }
}
