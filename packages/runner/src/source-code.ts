import { readFile } from "node:fs/promises";
import nodePath from "node:path";

import * as tsmorph from "ts-morph";
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

  console.log("outputText", outputText);

  return outputText;
};

export const getTransformer = (source: string) => {
  type Exports =
    | {
        __esModule?: true;
        default?: unknown;
        handleSourceFile?: unknown;
        repomod?: Filemod<Dependencies, Record<string, unknown>>;
        filemod?: Filemod<Dependencies, Record<string, unknown>>;
      }
    | (() => void);

  const module = { exports: {} as Exports };
  const _require = (name: string) => {
    if (name === "ts-morph") {
      return tsmorph;
    }

    if (name === "node:path") {
      return nodePath;
    }
  };

  const keys = ["module", "exports", "require"];
  const values = [module, module.exports, _require];

  new Function(...keys, source).apply(null, values);

  return typeof module.exports === "function"
    ? module.exports
    : module.exports.__esModule && typeof module.exports.default === "function"
      ? module.exports.default
      : typeof module.exports.handleSourceFile === "function"
        ? module.exports.handleSourceFile
        : module.exports.repomod !== undefined
          ? module.exports.repomod
          : module.exports.filemod !== undefined
            ? module.exports.filemod
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

  return indexPath.endsWith(".ts")
    ? transpile(codemodSource.toString())
    : codemodSource.toString();
};
