/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import slugify from "@sindresorhus/slugify";
import filenamify from "filenamify";
import * as glob from "glob";
import { fileContext, getCwdContext } from "./contexts";

const DIRECTORY = "cm";

export const getTmpDir = (...rawParts: string[]) => {
  const parts = rawParts.map((part) => {
    const slug = slugify(part);
    return filenamify(slug);
  });
  const dirpath = path.join(os.tmpdir(), DIRECTORY, ...parts);

  return dirpath;
};

export const rm = async (dir: string) => {
  await fs.rm(dir, {
    recursive: true,
    force: true,
    retryDelay: 1000,
    maxRetries: 5,
  });
};

export const files = async (
  pattern: string | string[],
  cb: () => Promise<void>,
) => {
  const { cwd } = getCwdContext();
  const files = await glob.glob(pattern, { cwd, nodir: true });
  for (const file of files) {
    await fileContext.run(
      { file: path.join(cwd, file), importsUpdates: [] },
      cb,
    );
  }
};

export const jsonFiles = async <T>(
  pattern: string | string[],
  cb: (args: {
    update: (updater: T | ((input: T) => T | Promise<T>)) => Promise<void>;
  }) => Promise<void>,
) => {
  const { cwd } = getCwdContext();
  const files = await glob.glob(pattern, { cwd, nodir: true });
  await cb({
    update: async (updater: T | ((input: T) => T | Promise<T>)) => {
      for (const file of files) {
        const filepath = path.join(cwd, file);
        if (typeof updater === "function") {
          const contents = JSON.parse(await fs.readFile(filepath, "utf-8"));
          // @ts-ignore
          const updatedContents = (await updater(contents)) as T;
          await fs.writeFile(
            filepath,
            JSON.stringify(updatedContents, null, 2),
          );
        } else {
          await fs.writeFile(filepath, JSON.stringify(updater, null, 2));
        }
      }
    },
  });
};

export const isDirectory = async (dir: string) => {
  try {
    const stats = await fs.stat(dir);
    await fs.access(
      dir,
      fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK,
    );
    return stats.isDirectory();
  } catch {
    return false;
  }
};
