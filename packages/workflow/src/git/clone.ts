import { memoize } from "lodash-es";
import { getTmpDir } from "src/fs.js";
import type { PLazy } from "../PLazy.js";
import { codemod } from "../codemod.js";
import {
  cwdContext,
  gitContext,
  parentCwdContext,
  repositoryContext,
} from "../contexts.js";
import { GitContext } from "../contexts/GitContext.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { exec } from "../exec.js";
import { files } from "../files.js";
import { dirs } from "../fs/dirs.js";
import { pr } from "../github/pr.js";
import { parseMultistring } from "../helpers.js";
import { jsFiles } from "../jsFiles.js";
import { branch } from "./branch.js";
import { commit } from "./commit.js";
import { cloneRepository, syncForkRepository } from "./helpers.js";
import { push } from "./push.js";

interface CloneOptions {
  repository: string;
  branch?: string;
  shallow?: boolean;
}

export type CloneReturn = PLazy<CloneHelpers> & CloneHelpers;

const mapCloneOptions = (options: string | CloneOptions): CloneOptions => {
  if (typeof options === "string") {
    return { repository: options, shallow: true };
  }
  return options;
};

/**
 * @description Clone a repository (could be used as follow up for github.fork)
 * @example
 * ```ts
 * import { github } from '@codemod.com/workflow'
 * await github.fork('git://github.com/codemod-com/codemod.git')
 *   .clone()
 *   .branch('new-branch')
 *   .files()
 *   .jsFam()
 *   .astGrep('console.log($$$ARGS)')
 *   .replace('console.error($$$ARGS)')
 * ```
 */
export function cloneLogic(): CloneReturn;

/**
 * @description Clone a repository with a callback (could be used as follow up for github.fork)
 * @param callback A callback would be called after the repositories are cloned with first argument as helpers
 * @example
 * ```ts
 * import { github } from '@codemod.com/workflow'
 * await github.fork('git://github.com/codemod-com/codemod.git')
 *   .clone(({ branch, commit, push, files }) => {
 *     await branch('new-branch')
 *     await files()
 *       .jsFam()
 *       .astGrep('console.log($$$ARGS)')
 *       .replace('console.error($$$ARGS)')
 *     await commit('feat: new branch')
 *     await push()
 * })
 * ```
 */
export function cloneLogic(
  callback: (helpers: CloneHelpers) => void | Promise<void>,
): CloneReturn;

/**
 * @description Clone repositories
 * @param rawRepositories List of repositories to clone, could be a string, template literals can be used to pass multiple repositories, array of strings, objects with repository and branch to clone
 * @example
 * ```ts
 * import { github } from '@codemod.com/workflow'
 * await github.clone('git://github.com/codemod-com/codemod.git')
 *   .branch('new-branch')
 *   .files()
 *   .jsFam()
 *   .astGrep('console.log($$$ARGS)')
 *   .replace('console.error($$$ARGS)')
 * ```
 */
export function cloneLogic(
  rawRepositories:
    | (string | CloneOptions)[]
    | string
    | readonly string[]
    | CloneOptions
    | CloneOptions[],
): CloneReturn;

/**
 * @description Clone repositories with a callback
 * @param rawRepositories List of repositories to clone, could be a string, template literals can be used to pass multiple repositories, array of strings, objects with repository and branch to clone
 * @param callback A callback would be called after the repositories are cloned with first argument as helpers
 * @example
 * ```ts
 * import { github } from '@codemod.com/workflow'
 * await github.clone('git://github.com/codemod-com/codemod.git', ({ branch, commit, push, files }) => {
 *   await branch('new-branch')
 *   await files()
 *     .jsFam()
 *     .astGrep('console.log($$$ARGS)')
 *     .replace('console.error($$$ARGS)')
 *   await commit('feat: new branch')
 *   await push()
 * })
 */
export function cloneLogic(
  rawRepositories:
    | (string | CloneOptions)[]
    | string
    | readonly string[]
    | CloneOptions
    | CloneOptions[],
  callback: (helpers: CloneHelpers) => void | Promise<void>,
): CloneReturn;

export function cloneLogic(
  rawRepositories?:
    | (string | CloneOptions)[]
    | string
    | readonly string[]
    | CloneOptions
    | CloneOptions[]
    | ((helpers: CloneHelpers) => void | Promise<void>),
  callback?: (helpers: CloneHelpers) => void | Promise<void>,
): CloneReturn {
  const memoizedCloneRepo = memoize(cloneRepository);
  const memoizedSyncForkedRepo = memoize(syncForkRepository);
  return new FunctionExecutor("clone")
    .arguments(() => {
      let repositories: CloneOptions[] = [];
      let resultCallback = callback;

      if (
        typeof rawRepositories === "string" ||
        (Array.isArray(rawRepositories) &&
          rawRepositories.every((repo) => typeof repo === "string"))
      ) {
        repositories = parseMultistring(
          rawRepositories as string | readonly string[],
        ).map(mapCloneOptions);
      } else if (Array.isArray(rawRepositories)) {
        repositories = rawRepositories.map(mapCloneOptions);
      } else if (typeof rawRepositories === "function") {
        repositories = [];
        resultCallback = rawRepositories;
      } else if (rawRepositories) {
        repositories = [
          mapCloneOptions(rawRepositories as string | CloneOptions),
        ];
      }

      return {
        repositories,
        callback: resultCallback,
      };
    })
    .helpers(cloneHelpers)
    .executor(async (next, self) => {
      const { repositories } = self.getArguments();
      const repo = repositoryContext.getStore();
      if (repositories.length === 0) {
        if (repo) {
          repositories.push({ ...repo, shallow: true });
        }
      }
      await Promise.all(
        repositories.map(({ repository, shallow, branch }, index) =>
          cwdContext.run({ cwd: process.cwd() }, async () => {
            const id = `${repository}, ${String(index)}, ${String(
              shallow,
            )}, ${String(branch)}`;
            const tmpDir = getTmpDir(`${repository}${String(index)}`);
            const cwd = cwdContext.getStore();
            const parentCwd = parentCwdContext.getStore();
            if (cwd) {
              cwd.cwd = tmpDir;
            }
            if (parentCwd) {
              parentCwd.cwd = tmpDir;
            }
            await memoizedCloneRepo(id, {
              repositoryUrl: repository,
              branch,
              shallow,
              extraName: String(index),
              tmpDir,
            });
            if (repo?.forkedFrom) {
              await memoizedSyncForkedRepo(``, {
                branch,
                upstream: repo.forkedFrom,
                fork: repository,
              });
            }
            await gitContext.run(new GitContext({ repository, id }), next);
          }),
        ),
      );
    })
    .callback(async (self) => {
      const { callback } = self.getArguments();
      await callback?.(cloneHelpers);
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const clone = fnWrapper("clone", cloneLogic);

const cloneHelpers = {
  jsFiles,
  branch,
  commit,
  push,
  dirs,
  codemod,
  exec,
  files,
  pr,
};

export type CloneHelpers = typeof cloneHelpers;
