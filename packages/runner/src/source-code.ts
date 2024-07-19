// import { readFile } from "node:fs/promises";
import nodePath, { join } from "node:path";

import esbuild from "esbuild";
// import ts from "typescript";

import type { Filemod } from "@codemod-com/filemod";
import { type Codemod, extractMainScriptPath } from "@codemod-com/utilities";

import { readFile } from "node:fs/promises";
import type { Dependencies } from "#engines/filemod.js";

// export const transpile = (source: string): string => {
//   const { outputText } = ts.transpileModule(source, {
//     compilerOptions: {
//       target: ts.ScriptTarget.ES5,
//       module: ts.ModuleKind.CommonJS,
//     },
//   });

//   return outputText;
// };

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
    // if (name === "ts-morph") {
    //   return tsmorph;
    // }

    // if (name === "jscodeshift") {
    //   return jscodeshift;
    // }

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
  const { path: entryPoint, error } = await extractMainScriptPath({
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

  if (requiresBuild) {
    let licenseBuffer: string;

    try {
      licenseBuffer = (await readFile(join(codemod.path, "LICENSE"), "utf8"))
        .replace(/\/\*/gm, "\\/*")
        .replace(/\*\//gm, "*\\/");
    } catch {
      licenseBuffer = "";
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
      outputFiles?.find((file) => file.path === outputFilePath)?.contents ??
      null;

    if (contents === null) {
      throw new Error(`Could not find ${outputFilePath} in output files`);
    }

    const buffer = Buffer.concat([
      Buffer.from("/*! @license\n"),
      Buffer.from(licenseBuffer),
      Buffer.from("*/\n"),
      contents,
    ]);

    return buffer.toString();
  }

  return "";

  // const codemodSource = await readFile(indexPath, {
  //   encoding: "utf8",
  // });

  // return indexPath.endsWith(".ts")
  //   ? transpile(codemodSource.toString())
  //   : codemodSource.toString();
};

// export const getCodemodSourceCode = async (codemod: Codemod) => {
//   const { path: indexPath, error } = await extractMainScriptPath({
//     codemodRc: codemod.config,
//     source: codemod.path,
//   });

//   if (indexPath === null) {
//     throw new Error(error);
//   }

//   const codemodSource = await readFile(indexPath, {
//     encoding: "utf8",
//   });

//   return indexPath.endsWith(".ts")
//     ? transpile(codemodSource.toString())
//     : codemodSource.toString();
// };
