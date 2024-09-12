import { type NapiConfig, type SgNode, ts as astGrepTsx } from "@ast-grep/napi";
import type { PLazy } from "../PLazy.js";
import { astGrep } from "../astGrep/astGrep.js";
import { getImports } from "../astGrep/getImports.js";
import { getFileContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { jscodeshift } from "../jsFam/jscodeshift.js";

export type JsFamReturn = PLazy<Helpers> & Helpers;

/**
 * @description Adds javascript/typescript context to get specific helpers (jscodeshift, work with imports). Also, it will change glob pattern for `files()` search function.
 * @example
 * ```ts
 * await files()
 *   .jsFam()
 *   .jscodeshift((file, api) => {
 *     const j = api.jscodeshift;
 *     return j(file.source)
 *       .find(j.Identifier)
 *       .forEach((path) => {
 *         j(path).replaceWith(j.identifier("Hello"));
 *       })
 *   })
 * ```
 */
export function jsFamLogic(): JsFamReturn;
/**
 * @description Adds javascript/typescript context to get specific helpers (jscodeshift, work with imports). Also, it will change glob pattern for `files()` search function.
 * @param callback - A function that will be executed in the context of the javascript/typescript helpers.
 * @example
 * ```ts
 * await files()
 *   .jsFam(({ jscodeshift }) => {
 *     jscodeshift((file, api) => {
 *       const j = api.jscodeshift;
 *       return j(file.source)
 *         .find(j.Identifier)
 *         .forEach((path) => {
 *           j(path).replaceWith(j.identifier("Hello"));
 *         })
 *     })
 *   })
 * ```
 * @see {@link astGrep}
 * @see {@link jscodeshift}
 * @see {@link addImport}
 * @see {@link removeImport}
 */
export function jsFamLogic(
  callback: (helpers: Helpers) => void | Promise<void>,
): JsFamReturn;
export function jsFamLogic(
  callback?: (helpers: Helpers) => void | Promise<void>,
): JsFamReturn {
  return new FunctionExecutor("jsFam")
    .arguments(() => {
      return { callback };
    })
    .helpers(helpers)
    .setParentArgs({ defaultGlob: "**/*.{js,jsx,ts,tsx,cjs,mjs,cts,mts,d.ts}" })
    .return((self) => self.wrappedHelpers())
    .executor(async (next, self) => {
      const { callback } = self.getArguments();

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
                      currentImports.imports = currentImports.imports.filter(
                        (imp) => imp !== namedImport,
                      );
                    }
                  }
                }
              }
              if (modified) {
                return `import { ${currentImports.imports.join(", ")} } from "${
                  currentImports.from
                }"`;
              }
              return undefined;
            });
          }
        }
      }
    })
    .run() as any;
}

export const jsFam = fnWrapper("jsFam", jsFamLogic);

const helpers = {
  astGrep,
  getImports,
  addImport: (line: string) => {
    getFileContext().importsUpdates.push({ type: "add", import: line });
  },
  removeImport: (line: string) => {
    getFileContext().importsUpdates.push({ type: "remove", import: line });
  },
  jscodeshift,
};

export type Helpers = typeof helpers;
