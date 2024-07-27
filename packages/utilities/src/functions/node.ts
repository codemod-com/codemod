import { exec } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

export const execPromise = promisify(exec);

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isGeneratorEmpty = async (
  genFunc: () => AsyncGenerator<unknown> | Generator<unknown>,
) => {
  const tempGen = genFunc();
  const { done } = await tempGen.next();

  return done;
};

export const getAllFilePaths = async (dir: string, fileList: string[] = []) => {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      await getAllFilePaths(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }

  return fileList;
};
