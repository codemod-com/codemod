import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import ts from "typescript";

import type { Filemod } from "@codemod-com/filemod";
import { type Codemod, extractMainScriptPath } from "@codemod-com/utilities";

import type { Dependencies } from "#engines/filemod.js";

export const transpile = (source: string): string => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
    },
  });

  return outputText;
};

export const getTransformer = async (entryPath: string) => {
  const entryURL = pathToFileURL(entryPath).href;

  type Module =
    | {
        __esModule?: true;
        default?: unknown;
        handleSourceFile?: unknown;
        repomod?: Filemod<Dependencies, Record<string, unknown>>;
        filemod?: Filemod<Dependencies, Record<string, unknown>>;
      }
    | (() => void);

  const entryModule = (await import(entryURL)) as Module;

  return typeof entryModule === "function"
    ? entryModule
    : entryModule.__esModule && typeof entryModule.default === "function"
      ? entryModule.default
      : typeof entryModule.handleSourceFile === "function"
        ? entryModule.handleSourceFile
        : entryModule.repomod !== undefined
          ? entryModule.repomod
          : entryModule.filemod !== undefined
            ? entryModule.filemod
            : null;
};

export const getCodemodSourceCode = async (codemod: Codemod) => {
  const { path: indexPath, error } = await extractMainScriptPath({
    codemodRc: codemod.config,
    source: codemod.path,
  });

  if (indexPath === null) {
    throw new Error(error);
  }

  const codemodSource = await readFile(indexPath, {
    encoding: "utf8",
  });

  return codemod.path.endsWith(".ts")
    ? transpile(codemodSource.toString())
    : codemodSource.toString();
};
