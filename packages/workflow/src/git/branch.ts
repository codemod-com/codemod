import { memoize } from "lodash-es";
import type { PLazy } from "../PLazy.js";
import { codemod } from "../codemod.js";
import { getGitContext } from "../contexts.js";
import type { GitContext } from "../contexts/GitContext.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { exec } from "../exec.js";
import { files } from "../files.js";
import { dirs } from "../fs/dirs.js";
import { jsFiles } from "../jsFiles.js";
import { commit } from "./commit.js";
import { push } from "./push.js";

interface BranchOptions {
  /**
   * @description Branch name to checkout
   */
  branch: string;
  /**
   * @description Force checkout to branch
   * @default true
   */
  force?: boolean;
}

export type BranchReturn = PLazy<BranchHelpers> & BranchHelpers;

/**
 * @description Creates branch for every repository
 * @param newBranch Branch name to checkout, could be a string or an object with branch and force
 * @example
 * ```ts
 * // chain call
 * import { git } from '@codemod.com/workflow'
 * await git.clone('git@github.com:codemod-com/codemod.git')
 *   .branch('new-branch')
 * ```
 * @example
 * ```ts
 * // existing branch
 * import { git } from '@codemod.com/workflow'
 * await git.clone('git@github.com:codemod-com/codemod.git')
 *   .branch({
 *     branch: 'new-branch',
 *     force: false
 *   })
 * ```
 * @see {@link jsFiles}
 * @see {@link files}
 * @see {@link dirs}
 * @see {@link exec}
 * @see {@link commit}
 * @see {@link push}
 * @see {@link codemod}
 */
export function branchLogic(newBranch: string | BranchOptions): BranchReturn;

/**
 * Creates branch for current repository
 * @param newBranch Branch name to checkout, could be a string or an object with branch and force
 * @param callback A callback would be called after the branch is created with first argument as helpers
 * @example
 * ```ts
 * // inside callback
 * import { git } from '@codemod.com/workflow'
 * await git.clone('git@github.com:codemod-com/codemod.git', async ({ branch }) => {
 *   await branch('new-branch')
 * })
 * ```
 * @see {@link jsFiles}
 * @see {@link files}
 * @see {@link dirs}
 * @see {@link exec}
 * @see {@link commit}
 * @see {@link push}
 * @see {@link codemod}
 */
export function branchLogic(
  newBranch: string | BranchOptions,
  callback: (helpers: BranchHelpers) => void | Promise<void>,
): BranchReturn;

export function branchLogic(
  newBranch: string | BranchOptions,
  callback?: (helpers: BranchHelpers) => void | Promise<void>,
): BranchReturn {
  const branchoutMemoized = memoize(
    (key: string, gitContext: GitContext, branch: string, force?: boolean) =>
      gitContext.checkout({ branch, force }),
  );
  return new FunctionExecutor("branch")
    .arguments(() => {
      return {
        branchArg:
          typeof newBranch === "string"
            ? ({ branch: newBranch, force: true } as BranchOptions)
            : newBranch,
        callback,
      };
    })
    .helpers(branchHelpers)
    .executor(async (next, self) => {
      const { branchArg } = self.getArguments();
      const gitContext = getGitContext();
      await branchoutMemoized(
        `${gitContext.get("id")}-${branchArg.branch}-${String(
          branchArg.force,
        )}`,
        gitContext,
        branchArg.branch,
        branchArg.force,
      );
      await next();
    })
    .callback(async (self) => {
      const { callback } = self.getArguments();
      await callback?.(branchHelpers);
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const branch = fnWrapper("branch", branchLogic);

const branchHelpers = { jsFiles, commit, push, dirs, codemod, exec, files };

export type BranchHelpers = typeof branchHelpers;
