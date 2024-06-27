import { type NapiConfig, type SgNode, ts as astGrepTsx } from "@ast-grep/napi";
import type { PLazy } from "./PLazy.js";
import { astGrep } from "./astGrep/astGrep.js";
import { getImports } from "./astGrep/getImports.js";
import { getFileContext } from "./contexts.js";
import { FunctionExecutor, fnWrapper } from "./engineHelpers.js";

/**
 * @description Filter all js/ts files in current directory
 */
export function jsFamLogic(): PLazy<Helpers> & Helpers;
export function jsFamLogic(
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsFamLogic(
  callback?: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("jsFam")
    .arguments(() => {
      return { callback };
    })
    .helpers(helpers)
    .setParentArgs({ defaultGlob: "**/*.{js,jsx,ts,tsx,cjs,mjs}" })
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
};

export type Helpers = typeof helpers;
