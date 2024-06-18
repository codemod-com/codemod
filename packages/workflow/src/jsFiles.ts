import * as path from "node:path";
import { type NapiConfig, type SgNode, ts as astGrepTsx } from "@ast-grep/napi";
import * as glob from "glob";
import type { PLazy } from "./PLazy.js";
import { astGrep } from "./astGrep/astGrep.js";
import { getImports } from "./astGrep/getImports.js";
import { fileContext, getCwdContext, getFileContext } from "./contexts.js";
import { FunctionExecutor, fnWrapper } from "./engineHelpers.js";
import { parseMultistring } from "./helpers.js";

/**
 * @description Filter all js/ts files in current directory
 * @deprecated Use `files().js()` instead
 */
export function jsFilesLogic(): PLazy<Helpers> & Helpers;
/**
 * @description Filter file by glob pattern
 * @deprecated Use `files(glob).js()` instead
 * @param globs string or array of globs to search for a files, could be comma/space separated string
 * @example
 * ```ts
 *   await jsFiles('src/app.ts,src/**∕*.tsx').astGrep`import React from 'react'`;
 * ```
 */
export function jsFilesLogic(
  globs: string | readonly string[],
): PLazy<Helpers> & Helpers;
/**
 * @description Filter file by glob pattern and apply callback
 * @deprecated Use `files(glob).js(callback)` instead
 */
export function jsFilesLogic(
  globs: string | readonly string[],
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
/**
 * @description Filter all js/ts files in current directory and apply callback
 * @deprecated Use `files().js(callback)` instead
 */
export function jsFilesLogic(
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsFilesLogic(
  rawGlobs?:
    | string
    | readonly string[]
    | ((helpers: Helpers) => void | Promise<void>),
  maybeCallback?: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("jsFiles")
    .arguments(() => {
      const globs = parseMultistring(
        !rawGlobs || typeof rawGlobs === "function"
          ? "**/*.{js,jsx,ts,tsx,cjs,mjs}"
          : rawGlobs,
        /[\n; ]/,
      );

      const callback =
        typeof rawGlobs === "function" ? rawGlobs : maybeCallback;
      return { globs, callback };
    })
    .helpers(helpers)
    .executor(async (next, self) => {
      const { globs, callback } = self.getArguments();
      const { cwd } = getCwdContext();
      const files = await glob.glob(globs, {
        cwd,
        nodir: true,
        ignore: [
          "**/node_modules/**",
          "**/.git/**",
          "**/dist/**",
          "**/build/**",
        ],
      });

      for (const file of files) {
        await fileContext.run(
          { file: path.join(cwd, file), importsUpdates: [] },
          async () => {
            if (callback) {
              await callback(helpers);
            }

            await next();

            const { importsUpdates } = getFileContext();
            const getImportInfo = (node: SgNode) => ({
              from: node.getMatch("FROM")?.text(),
              imports: node
                .getMultipleMatches("IMPORTS")
                .filter((n) => n.kind() !== ",")
                .map((n) => n.text()),
            });
            const importRule: NapiConfig = {
              rule: {
                any: [
                  { pattern: "import { $$$IMPORTS } from '$FROM'" },
                  { pattern: 'import { $$$IMPORTS } from "$FROM"' },
                ],
              },
            };
            if (importsUpdates.length) {
              for (const { type, import: line } of importsUpdates) {
                const namedImportsToChange = astGrepTsx
                  .parse(line)
                  .root()
                  .findAll(importRule);
                for (const node of namedImportsToChange) {
                  const importChange = getImportInfo(node);
                  await astGrep(importRule).replace(({ getNode }) => {
                    const currentImports = getImportInfo(getNode());
                    let modified = false;
                    if (currentImports.from === importChange.from) {
                      for (const namedImport of importChange.imports) {
                        if (type === "add") {
                          if (!currentImports.imports.includes(namedImport)) {
                            modified = true;
                            currentImports.imports.push(namedImport);
                          }
                        } else if (type === "remove") {
                          if (currentImports.imports.includes(namedImport)) {
                            modified = true;
                            currentImports.imports =
                              currentImports.imports.filter(
                                (imp) => imp !== namedImport,
                              );
                          }
                        }
                      }
                    }
                    if (modified) {
                      return `import { ${currentImports.imports.join(
                        ", ",
                      )} } from "${currentImports.from}"`;
                    }
                    return undefined;
                  });
                }
              }
            }
          },
        );
      }
    })
    .run() as any;
}

export const jsFiles = fnWrapper("jsFiles", jsFilesLogic);

const helpers = {
  astGrep,
  getImports,
  addImport: (line: string) => {
    getFileContext().importsUpdates.push({ type: "add", import: line });
  },
  removeImport: (line: string) => {
    getFileContext().importsUpdates.push({ type: "remove", import: line });
  },
};

type Helpers = typeof helpers;
