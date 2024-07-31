import { extname } from "node:path";
import type { ArgumentRecord, FileCommand } from "@codemod-com/utilities";
import { Project } from "ts-morph";
import { getAdapterByExtname } from "#adapters/index.js";
import { getTransformer } from "#source-code.js";
import { isTheSameData } from "#utils.js";

export const runTsMorphCodemod = (
  codemodSource: string,
  oldPath: string,
  oldData: string,
  safeArgumentRecord: ArgumentRecord,
): readonly FileCommand[] => {
  const adapter = getAdapterByExtname(extname(oldPath));

  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const sourceFile = project.createSourceFile(oldPath, oldData);

  const transform = getTransformer(codemodSource);
  if (typeof transform !== "function" || transform === null) {
    throw new Error("Invalid codemod source");
  }

  const newData = transform(sourceFile, safeArgumentRecord);

  if (typeof newData !== "string" || isTheSameData(oldData, newData)) {
    return [];
  }

  return [
    {
      kind: "updateFile",
      oldPath,
      oldData,
      newData,
    },
  ];
};
