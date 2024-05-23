import * as path from "node:path";
import { type SgNode, tsx as astGrepTsx } from "@ast-grep/napi";
import * as fg from "fast-glob";
import { PLazy } from "./PLazy.js";
import { astGrep } from "./astGrep/astGrep.js";
import {
  fileContext,
  getCwdContext,
  getFileContext,
  getParentContext,
} from "./contexts.js";
import { parseMultistring, wrapHelpers } from "./helpers.js";

const helpers = {
  astGrep,
  addImport: (line: string) => {
    getFileContext().importsUpdates.push({ type: "add", import: line });
  },
  removeImport: (line: string) => {
    getFileContext().importsUpdates.push({ type: "remove", import: line });
  },
};

type Helpers = typeof helpers;

/**
 * @description Filter file by glob pattern
 * @param globs string or array of globs to search for a files, could be comma/space separated string
 * @example
 * ```ts
 *   await jsFiles('src/app.ts,src/**∕*.tsx').astGrep`import React from 'react'`;
 * ```
 */
export function jsFiles(
  globs: string | readonly string[],
): PLazy<Helpers> & Helpers;
export function jsFiles(
  globs: string | readonly string[],
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsFiles(
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsFiles(
  rawGlobs:
    | string
    | readonly string[]
    | ((helpers: Helpers) => void | Promise<void>),
  maybeCallback?: (helpers: Helpers) => void | Promise<void>,
) {
  const innerParentContext = getParentContext();

  const globs = parseMultistring(
    typeof rawGlobs === "function" ? "**/*.{js,jsx,ts,tsx,cjs,mjs}" : rawGlobs,
    /[\n; ]/,
  );

  const callback = typeof rawGlobs === "function" ? rawGlobs : maybeCallback;

  const context = async (cb?: any) => {
    await innerParentContext(() =>
      Promise.all(
        globs.map(async (glob) => {
          const { cwd } = getCwdContext();
          const files = await fg.glob(glob, {
            cwd,
            onlyFiles: true,
            ignore: [
              "**/node_modules/**",
              "**/.git/**",
              "**/dist/**",
              "**/build/**",
            ],
          });

          if (cb) {
            for (const file of files) {
              await fileContext.run(
                { file: path.join(cwd, file), importsUpdates: [] },
                async (...args) => {
                  // Remote execution should be here
                  // if (cb) {
                  //   console.log('remote run:');
                  //   console.log(getContextsSnapshot());
                  //   console.log(cb.toString());
                  // }
                  const result = await cb(...args);

                  const { importsUpdates } = getFileContext();

                  const getImportInfo = (node: SgNode) => ({
                    from: node.getMatch("FROM")?.text(),
                    imports: node
                      .getMultipleMatches("IMPORTS")
                      .filter((n) => n.kind() !== ",")
                      .map((n) => n.text()),
                  });

                  if (importsUpdates.length) {
                    for (const { type, import: line } of importsUpdates) {
                      const namedImportsToChange = astGrepTsx
                        .parse(line)
                        .root()
                        .findAll(`import { $$$IMPORTS } from "$FROM"`);
                      for (const node of namedImportsToChange) {
                        const importChange = getImportInfo(node);
                        await astGrep(
                          `import { $$$IMPORTS } from "$FROM"`,
                        ).replace(({ getNode }) => {
                          const currentImports = getImportInfo(getNode());
                          let modified = false;
                          if (currentImports.from === importChange.from) {
                            for (const namedImport of importChange.imports) {
                              if (type === "add") {
                                if (
                                  !currentImports.imports.includes(namedImport)
                                ) {
                                  modified = true;
                                  currentImports.imports.push(namedImport);
                                }
                              } else if (type === "remove") {
                                if (
                                  currentImports.imports.includes(namedImport)
                                ) {
                                  modified = true;
                                  currentImports.imports.filter(
                                    (imp) => imp !== namedImport,
                                  );
                                }
                              }
                            }
                          }

                          if (modified) {
                            return `import {${currentImports.imports.join(
                              ", ",
                            )}} from "${currentImports.from}"`;
                          }

                          return undefined;
                        });
                      }
                    }
                  }

                  return result;
                },
                helpers,
              );
            }
          }

          return Promise.resolve(wrapHelpers(helpers, context));
        }),
      ),
    );

    return wrapHelpers(helpers, context);
  };

  const helpersWithContext = wrapHelpers(helpers, context);

  const promise = new PLazy<Helpers>((resolve, reject) => {
    if (callback) {
      const voidOrPromise = context(callback);
      if (voidOrPromise instanceof Promise) {
        voidOrPromise
          .then(() => resolve(wrapHelpers(helpers, context)))
          .catch(reject);
      }
    } else {
      context().then(resolve).catch(reject);
    }
  }) as PLazy<Helpers> & Helpers;

  Object.keys(helpersWithContext).forEach((key) => {
    // @ts-ignore
    promise[key] = helpersWithContext[key];
  });

  return promise;
}
