import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as glob from "glob";
import type { PLazy } from "../PLazy.js";
import { codemod } from "../codemod.js";
import { cwdContext, getCwdContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { exec } from "../exec.js";
import { parseMultistring } from "../helpers.js";
import { jsFiles } from "../jsFiles.js";
import { map } from "./map.js";
import { move } from "./move.js";

type DirsParams = {
  create?: boolean;
  dirs: string | readonly string[];
};

/**
 * @description Run a callback for each directory matching the pattern
 * @param pattern Glob pattern or array of glob patterns
 * @param cb
 * @example dirs`apps`
 *            .jsFiles`*.ts`
 *            .astGrep`import React from 'react'`
 *            .remove();
 * @example dirs('apps/*', async ({ jsFiles }) => {
 *            await jsFiles`*.ts`
 *              .astGrep`import React from 'react'`
 *              .remove();
 *          });
 * @example dirs(async ({ jsFiles }) => {
 *            await jsFiles`*.ts`
 *              .astGrep`import React from 'react'`
 *              .remove();
 *          });
 */
export function dirsLogic(
  pattern:
    | string
    | readonly string[]
    | { create?: boolean; dirs: string | readonly string[] },
  callback?: (helpers: DirsHelpers) => Promise<void> | void,
): PLazy<DirsHelpers> & DirsHelpers {
  return new FunctionExecutor("dirs")
    .arguments(() => {
      if (typeof pattern === "object" && !Array.isArray(pattern)) {
        const { dirs, ...rest } = pattern as DirsParams;
        return {
          params: {
            ...rest,
            dirs: parseMultistring(dirs),
          },
          callback,
        };
      }

      const patterns = parseMultistring(pattern);

      const create =
        patterns.length === 1 && !glob.hasMagic(patterns[0] as string);

      return {
        params: {
          create,
          dirs: patterns,
        },
        callback,
      };
    })
    .helpers(dirsHelpers)
    .executor(async (next, self) => {
      const {
        params: { dirs: directories, create },
      } = self.getArguments();
      const { cwd } = getCwdContext();
      const dirs = await glob.glob(
        directories.map((d) => (d.endsWith("/") ? d : `${d}/`)),
        { cwd },
      );
      const directoriesWalked = new Set<string>();
      for (const dir of dirs) {
        if (directoriesWalked.has(dir)) {
          continue;
        }
        directoriesWalked.add(dir);
        await cwdContext.run({ cwd: path.join(cwd, dir) }, next);
      }
      if (create) {
        for (const directoryShouldExist of directories) {
          if (
            !glob.hasMagic(directoryShouldExist) &&
            !directoriesWalked.has(directoryShouldExist)
          ) {
            directoriesWalked.add(directoryShouldExist);
            console.log(
              `Creating directory ${path.join(cwd, directoryShouldExist)}`,
            );
            await fs.mkdir(path.join(cwd, directoryShouldExist), {
              recursive: true,
            });
            await cwdContext.run(
              { cwd: path.join(cwd, directoryShouldExist) },
              next,
            );
          }
        }
      }
    })
    .callback(async (self) => {
      const { callback } = self.getArguments();
      await callback?.(dirsHelpers);
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const dirs = fnWrapper("dirs", dirsLogic);

const dirsHelpers = { dirs, jsFiles, codemod, exec, move, map };

type DirsHelpers = typeof dirsHelpers;
