import { extname } from "node:path";
import jscodeshift, { type API, type Parser } from "jscodeshift";

import type {
  ArgumentRecord,
  EngineOptions,
  FileCommand,
} from "@codemod-com/utilities";
import { defaultJSCodeshiftParser } from "@codemod.com/codemod-utils";
import { getAdapterByExtname } from "#adapters/index.js";
import type { TransformFunction } from "#source-code.js";
import { isTheSameData } from "#utils.js";

export const buildApi = (parser: string | Parser): API => ({
  j: jscodeshift.withParser(parser),
  jscodeshift: jscodeshift.withParser(parser),
  stats: () => {},
  report: () => {},
});

export const runJscodeshiftCodemod = (
  transformer: TransformFunction,
  path: string,
  data: string,
  safeArgumentRecord: ArgumentRecord,
  engineOptions: (EngineOptions & { engine: "jscodeshift" }) | null,
): readonly FileCommand[] => {
  const commands: FileCommand[] = [];

  const createFile = (newPath: string, newData: string): void => {
    commands.push({
      kind: "createFile",
      newPath,
      newData,
    });
  };

  const api = buildApi(engineOptions?.parser ?? defaultJSCodeshiftParser);

  const adapter = getAdapterByExtname(extname(path));
  const transform = adapter !== null ? adapter(transformer) : transformer;

  const newData = transform({ source: data, path: path }, api, {
    ...safeArgumentRecord,
    createFile,
  });

  if (typeof newData !== "string" || isTheSameData(data, newData)) {
    return commands;
  }

  commands.push({
    kind: "updateFile",
    oldPath: path,
    oldData: data,
    newData,
  });

  return commands;
};
