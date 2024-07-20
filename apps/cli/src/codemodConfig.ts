import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseCodemodConfig } from "@codemod-com/utilities";

export const getCodemodConfig = async (baseDir: string) => {
  let codemodRcContent: string;
  try {
    codemodRcContent = await readFile(
      resolve(join(baseDir, ".codemodrc.json")),
      "utf-8",
    );
  } catch (error) {
    throw new Error(
      `Could not find the .codemodrc.json file in the codemod directory: ${baseDir}.`,
    );
  }

  return parseCodemodConfig(JSON.parse(codemodRcContent));
};
