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
  branch: string;
  force?: boolean;
}

/**
 * Creates branch for current repository
 */
export function branchLogic(
  rawBranches: string | BranchOptions,
): PLazy<BranchHelpers> & BranchHelpers;
/**
 * Creates branch for current repository
 */
export function branchLogic(
  rawBranches: string | BranchOptions,
  callback: (helpers: BranchHelpers) => void | Promise<void>,
): PLazy<BranchHelpers> & BranchHelpers;
/**
 * Creates branch for current repository
 */
export function branchLogic(
  rawBranches: string | BranchOptions,
  callback?: (helpers: BranchHelpers) => void | Promise<void>,
) {
  const branchoutMemoized = memoize(
    (key: string, gitContext: GitContext, branch: string, force?: boolean) =>
      gitContext.checkout({ branch, force }),
  );
  return new FunctionExecutor("branch")
    .arguments(() => {
      return {
        branchArg:
          typeof rawBranches === "string"
            ? ({ branch: rawBranches, force: true } as BranchOptions)
            : rawBranches,
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

type BranchHelpers = typeof branchHelpers;
