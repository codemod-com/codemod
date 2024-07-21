import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as pathPosix from "node:path/posix";
import * as glob from "glob";
import type { PLazy } from "../PLazy.js";
import {
  cwdContext,
  fileContext,
  getCwdContext,
  getFileContext,
  getParentCwdContext,
} from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { files } from "../files.js";

const ALL_JS_EXTENSIONS = ["js", "jsx", "ts", "tsx", "cjs", "mjs"];

const getPathBeforeRename = (
  newPath: string,
  renames: Record<string, string>,
) => {
  for (const [beforeRename, afterRename] of Object.entries(renames)) {
    if (newPath === afterRename) {
      return beforeRename;
    }
  }
  return undefined;
};

const getRenamedPath = async (
  oldPath: string,
  renames: Record<string, string>,
) => {
  if (oldPath in renames) {
    return renames[oldPath];
  }

  // Try remove query params
  const queryIndex = oldPath.indexOf("?");
  if (queryIndex !== -1) {
    const maybeFilePath = oldPath.slice(0, queryIndex);
    if (maybeFilePath in renames) {
      return `${renames[maybeFilePath]}?${oldPath.slice(queryIndex + 1)}`;
    }
  }

  // Try to guess imports
  // If it is a JS file
  for (const ext of ALL_JS_EXTENSIONS) {
    const maybeFilePath = `${oldPath}.${ext}`;
    if (maybeFilePath in renames) {
      return pathPosix.format({
        ...pathPosix.parse(renames[maybeFilePath] as string),
        base: undefined,
        ext: undefined,
      });
    }
  }
  // If it is directory
  try {
    if ((await fs.stat(oldPath)).isDirectory()) {
      for (const ext of ALL_JS_EXTENSIONS) {
        const maybeFilePath = `${pathPosix.join(oldPath, "index")}.${ext}`;
        if (maybeFilePath in renames) {
          return pathPosix.format({
            ...pathPosix.parse(renames[maybeFilePath] as string),
            base: undefined,
            ext: undefined,
            name: undefined,
          });
        }
      }
    }
  } catch (e) {
    // do nothing
  }

  return undefined;
};

const renameImport = async (
  newAbsoluteSelfPath: string,
  renames: Record<string, string>,
  importPath: string,
) => {
  // Only relative, excluding package.json
  if (importPath?.startsWith(".") && !importPath.endsWith("package.json")) {
    const oldAbsoluteSelfPath = getPathBeforeRename(
      newAbsoluteSelfPath,
      renames,
    );
    const oldAbsoluteImportPath = pathPosix.resolve(
      pathPosix.dirname(oldAbsoluteSelfPath ?? newAbsoluteSelfPath),
      importPath,
    );
    const newAbsoluteImportPath =
      (await getRenamedPath(oldAbsoluteImportPath, renames)) ??
      oldAbsoluteImportPath;
    let relativePath = pathPosix.join(
      pathPosix.relative(
        pathPosix.dirname(newAbsoluteSelfPath),
        pathPosix.dirname(newAbsoluteImportPath),
      ),
      pathPosix.basename(newAbsoluteImportPath),
    );
    if (!relativePath.startsWith(".")) {
      relativePath = `./${relativePath}`;
    }

    let extension: string | undefined = pathPosix.extname(relativePath);
    if (extension === ".ts") {
      extension = ".js";
    } else if (extension === ".tsx" || extension === ".jsx") {
      extension = undefined;
    }

    relativePath = pathPosix.format({
      ...pathPosix.parse(relativePath),
      base: undefined,
      ext: extension,
    });

    if (importPath !== relativePath) {
      return relativePath;
    }

    return importPath;
  }
  return importPath;
};

/**
 * @description Move directories or files matching the pattern
 */
export function moveLogic(target: string): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("move")
    .arguments(() => ({
      target,
    }))
    .helpers(helpers)
    .executor(async (next, self) => {
      const { target } = self.getArguments();
      const { cwd } = getCwdContext();
      const file = fileContext.getStore();
      let foundFiles: string[] = [];
      let isFile = false;
      if (file) {
        isFile = true;
        foundFiles = [path.basename(file.file)];
      } else {
        foundFiles = await glob.glob("**/*.*", {
          cwd,
          nodir: true,
          ignore: [
            "**/node_modules/**",
            "**/.git/**",
            "**/dist/**",
            "**/build/**",
          ],
        });
      }
      const renames: Record<string, string> = {};
      for (const file of foundFiles) {
        const source = path.resolve(cwd, file);
        const dest = path.resolve(
          target,
          ...(isFile ? [] : [path.basename(cwd)]),
          file,
        );
        console.log(`Moving ${source} to ${dest}`);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.rename(source, dest);
        if (dest.match(/\.(ts|js|tsx|jsx|cjs|mjs)$/)) {
          renames[source] = dest;
        }
        try {
          if (
            await fs.readdir(path.dirname(source)).then((x) => x.length === 0)
          ) {
            await fs.rmdir(path.dirname(source));
          }
        } catch (e) {}
      }
      try {
        if (await fs.readdir(cwd).then((x) => x.length === 0)) {
          await fs.rmdir(cwd);
        }
      } catch (e) {}

      await cwdContext.run(
        getParentCwdContext(),
        async () =>
          await files("**/*.{js,jsx,ts,tsx,cjs,mjs}").jsFam(
            async ({ astGrep }) => {
              const file = getFileContext().file;
              await astGrep({
                rule: {
                  any: [
                    {
                      kind: "string_fragment",
                      inside: {
                        kind: "string",
                        inside: {
                          any: [
                            { kind: "import_statement" },
                            { kind: "export_statement" },
                          ],
                        },
                      },
                    },
                    {
                      kind: "string_fragment",
                      inside: {
                        kind: "string",
                        inside: {
                          kind: "arguments",
                          inside: {
                            kind: "call_expression",
                            regex: "^require",
                          },
                        },
                      },
                    },
                  ],
                },
              }).replace(async ({ getNode }) => {
                return await renameImport(file, renames, getNode().text());
              });
            },
          ),
      );
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const move = fnWrapper("move", moveLogic);

const helpers = {};

type Helpers = typeof helpers;
