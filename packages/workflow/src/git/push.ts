import type { PLazy } from "../PLazy.js";
import { getCwdContext, getRepositoryContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { logger } from "../helpers.js";
import { spawn } from "../spawn.js";

export interface PushOptions {
  /**
   * @description Force push
   * @default true
   */
  force: boolean;
}

export type PushReturn = PLazy<Helpers> & Helpers;

/**
 * @description Push changes to the current repository
 * @param {PushOptions} options Options for push, force push is true by default
 * @example
 * ```ts
 * import { git } from '@codemod.com/workflow'
 * await git.clone('git://github.com/codemod-com/codemod.git', async ({ files, commit, push }) => {
 *   await files()
 *     .jsFam()
 *     .astGrep('console.log($$$ARGS)')
 *     .replace('console.error($$$ARGS)')
 *   await commit('feat: new branch')
 *   await push({ force: false })
 * })
 */
export function pushLogic(
  { force }: PushOptions = { force: true },
): PushReturn {
  return new FunctionExecutor("push")
    .arguments(() => ({ force }))
    .helpers(helpers)
    .executor(async (next) => {
      const { repository, branch } = getRepositoryContext();
      const { cwd } = getCwdContext();

      const log = logger(`Pushing to ${repository}/tree/${branch}`);
      try {
        await spawn("git", ["push", ...(force ? ["-f"] : [])], {
          cwd,
        });
        log.success();
      } catch (e: any) {
        log.fail(e.toString());
      }
      await next();
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const push = fnWrapper("push", pushLogic);

const helpers = {};

type Helpers = typeof helpers;
