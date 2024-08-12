import type { PLazy } from "../PLazy.js";
import { getCwdContext, repositoryContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { logger } from "../helpers.js";
import { spawn } from "../spawn.js";
import { push } from "./push.js";

export type CommitReturn = PLazy<Helpers> & Helpers;

/**
 * @description Commit changes to the current repository, adds all the files with `git add .`
 * @param message Commit message
 * @example
 * ```ts
 * import { git } from '@codemod.com/workflow'
 * await git.clone('git://github.com/codemod-com/codemod.git')
 *   .branch('new-branch', async ({ files, commit, push }) => {
 *     await files()
 *       .jsFam()
 *       .astGrep('console.log($$$ARGS)')
 *       .replace('console.error($$$ARGS)')
 *     await commit('feat: new branch')
 *     await push()
 *   })
 * ```
 */
export function commitLogic(message: string): CommitReturn {
  return new FunctionExecutor("commit")
    .arguments(() => ({
      message,
    }))
    .helpers(helpers)
    .executor(async (next, self) => {
      const { message } = self.getArguments();
      const { cwd } = getCwdContext();
      const repoContext = repositoryContext.getStore();
      const log = logger(
        `Committing${repoContext ? ` to ${repoContext.repository}/tree/${repoContext.branch}` : ""}${
          message ? ` with message: ${JSON.stringify(message)}` : ""
        }`,
      );
      try {
        await spawn("git", ["add", "."], { cwd });
        const { stdout } = await spawn("git", ["commit", "-m", message], {
          cwd: cwd,
          doNotThrowError: true,
        });
        if (stdout.join("").match(/nothing to commit, working tree clean/gm)) {
          log.warn("Nothing to commit");
        } else {
          log.success(stdout.join(""));
        }
      } catch (e: any) {
        log.fail(e.toString());
      }
      await next();
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const commit = fnWrapper("commit", commitLogic);

const helpers = { push };

type Helpers = typeof helpers;
