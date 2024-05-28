/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as fg from "fast-glob";
import { fileContext, getCwdContext } from "./contexts";

const DIRECTORY = "cm";

// A description why we are doing it this way would be nice to have.
// Is this dependency injection? Why do we need it that way?
const filenamify = async (a: string) => {
  const module =
    // biome-ignore lint/security/noGlobalEval: <explanation>
    ((await eval('import("filenamify")')) as typeof import("filenamify"))
      .default;
  return module(a);
};

const slugify = async (a: string) => {
  type Slugify = typeof import("@sindresorhus/slugify");
  // biome-ignore lint/security/noGlobalEval: <explanation>
  const module = ((await eval('import("@sindresorhus/slugify")')) as Slugify)
    .default;
  return module(a);
};

export const getTmpDir = async (...rawParts: string[]) => {
  const parts = await Promise.all(
    rawParts.map(async (part) => {
      const slug = await slugify(part);
      return await filenamify(slug);
    }),
  );
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
  const files = await fg.glob(pattern, { cwd, onlyFiles: true });
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
  const files = await fg.glob(pattern, { cwd, onlyFiles: true });
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
