import nodePath, { join } from "node:path";

import esbuild from "esbuild";
import tsmorph from "ts-morph";

import type { Filemod } from "@codemod-com/filemod";
import { type Codemod, getEntryPath } from "@codemod-com/utilities";

import { readFile } from "node:fs/promises";
import type { Dependencies } from "#engines/filemod.js";

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

export const getCodemodExecutable = async (codemod: Codemod) => {
  const { path: entryPoint, error } = await getEntryPath({
    codemodRc: codemod.config,
    source: codemod.path,
  });

  if (entryPoint === null) {
    throw new Error(error);
  }

  const requiresBuild =
    entryPoint.endsWith(".ts") ||
    entryPoint.endsWith(".js") ||
    entryPoint.endsWith(".cjs") ||
    entryPoint.endsWith(".mjs");

  if (!requiresBuild) {
    return readFile(entryPoint, { encoding: "utf8" });
  }

  const EXTERNAL_DEPENDENCIES = ["jscodeshift", "ts-morph", "@ast-grep/napi"];

  const outputFilePath = join(codemod.path, "./dist/index.cjs");

  const buildOptions: Parameters<typeof esbuild.build>[0] = {
    entryPoints: [entryPoint],
    bundle: true,
    external: EXTERNAL_DEPENDENCIES,
    platform: "node",
    minify: true,
    minifyWhitespace: true,
    format: "cjs",
    legalComments: "inline",
    outfile: outputFilePath,
    write: false, // to the in-memory file system
  };

  const { outputFiles } = await esbuild.build(buildOptions);

  const contents =
    outputFiles?.find((file) => file.path === outputFilePath)?.contents ?? null;

  if (contents === null) {
    throw new Error(`Could not find ${outputFilePath} in output files`);
  }

  return contents.toString();
};
