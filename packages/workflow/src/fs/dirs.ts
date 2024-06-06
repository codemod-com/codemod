import * as path from "node:path";
import * as glob from "glob";
import type { PLazy } from "../PLazy";
import { codemod } from "../codemod";
import { cwdContext, getCwdContext } from "../contexts";
import { FunctionExecutor, fnWrapper } from "../engineHelpers";
import { exec } from "../exec";
import { parseMultistring } from "../helpers";
import { jsFiles } from "../jsFiles";

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
  pattern: string | readonly string[],
  callback?: (helpers: DirsHelpers) => Promise<void> | void,
): PLazy<DirsHelpers> & DirsHelpers {
  return new FunctionExecutor("dirs")
    .arguments(() => ({
      directories: parseMultistring(pattern),
      callback,
    }))
    .helpers(dirsHelpers)
    .executor(async (next, self) => {
      const { directories } = self.getArguments();
      const { cwd } = getCwdContext();
      const dirs = await glob.glob(
        directories.map((d) => (d.endsWith("/") ? d : `${d}/`)),
        { cwd },
      );
      for (const dir of dirs) {
        await cwdContext.run({ cwd: path.join(cwd, dir) }, next);
      }
    })
    .callback(async (self) => {
      const { callback } = self.getArguments();
      await callback?.(self.wrappedHelpers());
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const dirs = fnWrapper("dirs", dirsLogic);

const dirsHelpers = { dirs, jsFiles, codemod, exec };

type DirsHelpers = typeof dirsHelpers;
