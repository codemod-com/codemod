import { readFile, stat, writeFile } from "node:fs/promises";
import axios from "axios";

const FILE_BASED_CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 1 week

export const downloadFile = async (options: {
  url: string;
  path: string;
  cache?: boolean;
}): Promise<{ data: Buffer; path: string; cached: boolean }> => {
  const { url, path } = options;

  const lastModified = await stat(path)
    .catch(() => null)
    .then((stats) => stats?.mtime.getTime() ?? null);

  const cache =
    lastModified !== null && lastModified + FILE_BASED_CACHE_TTL > Date.now();

  if (cache && options.cache) {
    return {
      data: Buffer.from(await readFile(path)),
      path,
      cached: true,
    };
  }

  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(data);

  await writeFile(path, buffer);

  return { data: buffer, path, cached: false };
};
