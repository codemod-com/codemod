import { readFile, stat, writeFile } from "node:fs/promises";
import axios from "axios";

export const downloadFile = async (options: {
  url: string;
  path: string;
  cache?: boolean;
}): Promise<{ data: Buffer; cacheUsed: boolean }> => {
  const { url, path, cache = true } = options;

  if (cache) {
    const localCodemodLastModified = await stat(path)
      .catch(() => null)
      .then((stats) => stats?.mtime.getTime() ?? null);

    const response = await axios
      .head(url, { timeout: 15000 })
      .catch(() => null);
    const lastModifiedS3 = response?.headers["last-modified"];
    const remoteCodemodLastModified = lastModifiedS3
      ? Date.parse(lastModifiedS3)
      : null;

    if (
      localCodemodLastModified !== null &&
      remoteCodemodLastModified !== null
    ) {
      const tDataOut = await readFile(path);

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

  await writeFile(path, buffer);

  return { data: buffer, cacheUsed: false };
};
