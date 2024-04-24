import nodePath from "node:path";
// Fixes The inferred type of 'getTransformer' cannot be named without a reference to
// '.pnpm/@babel+types@7.24.0/node_modules/@babel/types'.
// This is likely not portable. A type annotation is necessary.
// This should be fixed in future version of TypeScript:
// https://github.com/microsoft/TypeScript/issues/42873#issuecomment-2066874644
// TODO: update TypeScript
import type {} from "@babel/types";
import type { Filemod } from "@codemod-com/filemod";
import * as tsmorph from "ts-morph";
import ts from "typescript";
import type { Dependencies } from "./runRepomod.js";

export const transpile = (source: string): string => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
    },
  });

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
