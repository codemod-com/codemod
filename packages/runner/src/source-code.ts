import nodePath, { join, resolve } from "node:path";

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

export const BUILT_SOURCE_PATH = "cdmd_dist/index.cjs";

export const getCodemodExecutable = async (
  codemod: Pick<Codemod, "config" | "path">,
) => {
  const outputFilePath = join(resolve(codemod.path), BUILT_SOURCE_PATH);
  try {
    return await readFile(outputFilePath, { encoding: "utf8" });
  } catch {
    // continue
  }

  const { path: entryPoint } = await getEntryPath({
    source: codemod.path,
    throwOnNotFound: true,
  });

  const requiresBuild =
    entryPoint.endsWith(".ts") ||
    entryPoint.endsWith(".js") ||
    entryPoint.endsWith(".cjs") ||
    entryPoint.endsWith(".mjs");

  if (!requiresBuild) {
    return readFile(entryPoint, { encoding: "utf8" });
  }

  const EXTERNAL_DEPENDENCIES = ["jscodeshift", "ts-morph", "@ast-grep/napi"];

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
    logLevel: "error",
  };

  const { outputFiles } = await esbuild.build(buildOptions);

  const sourceCode =
    outputFiles?.find((file) => file.path.endsWith(outputFilePath))?.text ??
    null;

  if (sourceCode === null) {
    throw new Error(`Could not find ${outputFilePath} in output files`);
  }

  return sourceCode;
};
