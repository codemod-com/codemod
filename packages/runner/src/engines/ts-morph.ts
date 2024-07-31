import { Project } from "ts-morph";

import type { ArgumentRecord, FileCommand } from "@codemod-com/utilities";
import type { TransformFunction } from "#source-code.js";
import { isTheSameData } from "#utils.js";

export const runTsMorphCodemod = (
  transformer: TransformFunction,
  oldPath: string,
  oldData: string,
  safeArgumentRecord: ArgumentRecord,
): readonly FileCommand[] => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const sourceFile = project.createSourceFile(oldPath, oldData);

  const newData = transformer(sourceFile, safeArgumentRecord);

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
