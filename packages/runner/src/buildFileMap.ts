import { createHash } from "node:crypto";
import { dirname } from "node:path";
import type { FileSystem } from "@codemod-com/utilities";

export const buildFileMap = async (
  sourceFileSystem: FileSystem,
  targetFileSystem: FileSystem,
  paths: {
    include: string[];
    exclude: string[];
  },
): Promise<Map<string, string>> => {
  const fileMap = new Map<string, string>();

  for (const path of paths.include) {
    const data = await sourceFileSystem.promises.readFile(path, {
      encoding: "utf8",
    });

    await targetFileSystem.promises.mkdir(dirname(path), {
      recursive: true,
    });
    await targetFileSystem.promises.writeFile(path, data);

    const dataHashDigest = createHash("ripemd160")
      .update(data)
      .digest("base64url");

    fileMap.set(path, dataHashDigest);
  }

  return fileMap;
};
