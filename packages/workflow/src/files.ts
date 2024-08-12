import * as path from "node:path";
import * as glob from "glob";
import type { PLazy } from "./PLazy.js";
import { astGrep } from "./astGrep/astGrep.js";
import { fileContext, getCwdContext } from "./contexts.js";
import { FileContext } from "./contexts/FileContext.js";
import { FunctionExecutor, fnWrapper } from "./engineHelpers.js";
import { move } from "./fs/move.js";
import { parseMultistring } from "./helpers.js";
import { jsFam } from "./jsFam.js";
import { json } from "./json/json.js";
import { yaml } from "./yaml/yaml.js";

/**
 * @description Filter all js/ts files in current directory
 */
export function filesLogic(): PLazy<Helpers> & Helpers;
/**
 * @description Filter file by glob pattern
 * @param globs string or array of globs to search for a files, could be comma/space separated string
 * @example
 * ```ts
 *   await jsFiles('src/app.ts,src/**∕*.tsx').astGrep`import React from 'react'`;
 * ```
 */
export function filesLogic(
  globs: string | readonly string[],
): PLazy<Helpers> & Helpers;
export function filesLogic(
  globs: string | readonly string[],
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function filesLogic(
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function filesLogic(
  rawGlobs?:
    | string
    | readonly string[]
    | ((helpers: Helpers) => void | Promise<void>),
  maybeCallback?: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("files")
    .arguments((self) => {
      const defaultGlob = self.getChildArg<string>("defaultGlob") ?? "**/*.*";
      const globs = parseMultistring(
        !rawGlobs || typeof rawGlobs === "function" ? defaultGlob : rawGlobs,
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
      const absolutePaths = globs.filter((g) => path.isAbsolute(g));
      const relativePaths = globs.filter((g) => !path.isAbsolute(g));
      const files = [
        ...(
          await glob.glob(relativePaths, {
            cwd,
            nodir: true,
            ignore: [
              "**/node_modules/**",
              "**/.git/**",
              "**/dist/**",
              "**/build/**",
            ],
          })
        ).map((f) => path.join(cwd, f)),
        ...absolutePaths,
      ];

      for (const file of files) {
        await fileContext.run(new FileContext({ file }), async () => {
          if (callback) {
            await callback(helpers);
          }

          await next();
        });
      }
    })
    .run() as any;
}

export const files = fnWrapper("files", filesLogic);

const helpers = { jsFam, move, astGrep, yaml, json };

type Helpers = typeof helpers;
