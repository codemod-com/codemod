import { readFile } from "node:fs/promises";
import ts from "typescript";

import type { Filemod } from "@codemod-com/filemod";
import { type Codemod, extractMainScriptPath } from "@codemod-com/utilities";

import { pathToFileURL } from "node:url";
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

export const getTransformer: any = async (entryPath: string) => {
  const entryURL = pathToFileURL(entryPath).href;

  try {
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
  } catch (err) {
    console.error("Error executing module:", err);
  }
  // type Exports =
  //   | {
  //       __esModule?: true;
  //       default?: unknown;
  //       handleSourceFile?: unknown;
  //       repomod?: Filemod<Dependencies, Record<string, unknown>>;
  //       filemod?: Filemod<Dependencies, Record<string, unknown>>;
  //     }
  //   | (() => void);

  // const module = { exports: {} as Exports };
  // const _require = (name: string) => {
  //   if (name === "ts-morph") {
  //     return tsmorph;
  //   }

  //   if (name === "node:path") {
  //     return nodePath;
  //   }
  // };

  // const keys = ["module", "exports", "require"];
  // const values = [module, module.exports, _require];

  // new Function(...keys, source).apply(null, values);

  // return typeof module.exports === "function"
  //   ? module.exports
  //   : module.exports.__esModule && typeof module.exports.default === "function"
  //     ? module.exports.default
  //     : typeof module.exports.handleSourceFile === "function"
  //       ? module.exports.handleSourceFile
  //       : module.exports.repomod !== undefined
  //         ? module.exports.repomod
  //         : module.exports.filemod !== undefined
  //           ? module.exports.filemod
  //           : null;
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

// export const transpile = (source: string): string => {
//   const { outputText } = ts.transpileModule(source, {
//     compilerOptions: {
//       target: ts.ScriptTarget.ES5,
//       module: ts.ModuleKind.CommonJS,
//     },
//   });

//   return outputText;
// };

// export const getTransformer = async (entryPath: string) => {

//   const entryURL = pathToFileURL(entryPath).href;

//   try {
//     type Module =
//       | {
//           __esModule?: true;
//           default?: unknown;
//           handleSourceFile?: unknown;
//           repomod?: Filemod<Dependencies, Record<string, unknown>>;
//           filemod?: Filemod<Dependencies, Record<string, unknown>>;
//         }
//       | (() => void);

//     const entryModule = (await import(entryURL)) as Module;

//     const transformer = typeof entryModule === "function"
//       ? entryModule
//       : entryModule.__esModule && typeof entryModule.default === "function"
//         ? entryModule.default
//         : typeof entryModule.handleSourceFile === "function"
//           ? entryModule.handleSourceFile
//           : entryModule.repomod !== undefined
//             ? entryModule.repomod
//             : entryModule.filemod !== undefined
//               ? entryModule.filemod
//               : null;
//   } catch (err) {
//     console.error("Error executing module:", err);
//   }

//   // console.log("hello1");
//   // const module = { exports: {} as Exports };
//   // const _require = (name: string) => {
//   //   if (name === "ts-morph") {
//   //     return tsmorph;
//   //   }

//   //   if (name === "node:path") {
//   //     return nodePath;
//   //   }
//   // };

//   // const entryFileToExecute = tsImport(source, {});

//   // console.log("hello2");

//   // const keys = ["module", "exports", "require"];
//   // const values = [module, module.exports, _require];

//   // // console.log("hello3");
//   // // console.log(keys);
//   // // console.log(values);
//   // // console.log(source);
//   // new Function(...keys, source).apply(null, values);

//   // console.log("hello4");
//   // return typeof module.exports === "function"
//   //   ? module.exports
//   //   : module.exports.__esModule && typeof module.exports.default === "function"
//   //     ? module.exports.default
//   //     : typeof module.exports.handleSourceFile === "function"
//   //       ? module.exports.handleSourceFile
//   //       : module.exports.repomod !== undefined
//   //         ? module.exports.repomod
//   //         : module.exports.filemod !== undefined
//   //           ? module.exports.filemod
//   //           : null;
// };
