import * as fs from "node:fs";
import { basename, dirname, join } from "node:path";
import unzipper from "unzipper";

export const unpackZipCodemod = async (options: {
  source: string;
  target: string;
}) => {
  const { source, target } = options;

  let resultPath: string | null = null;

  const zip = fs
    .createReadStream(source)
    .pipe(unzipper.Parse({ forceStream: true }));

  for await (const entry of zip) {
    const writablePath = join(target, entry.path);

    if (entry.type === "Directory") {
      await fs.promises.mkdir(writablePath, { recursive: true });
      entry.autodrain(); // Skip processing the content of directory entries
    } else {
      if (basename(entry.path) === ".codemodrc.json") {
        resultPath = dirname(writablePath);
      }
      await fs.promises.mkdir(dirname(writablePath), { recursive: true });
      entry.pipe(fs.createWriteStream(writablePath));
    }
  }

  if (resultPath === null) {
    await fs.promises.rm(target, { recursive: true });
    return null;
  }

  return resultPath;
};
