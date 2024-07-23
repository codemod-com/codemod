import { memoize } from "lodash-es";
import type { PLazy } from "../PLazy.js";
import { codemod } from "../codemod.js";
import { cwdContext, gitContext, repositoryContext } from "../contexts.js";
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

const mapCloneOptions = (options: string | CloneOptions): CloneOptions => {
  if (typeof options === "string") {
    return { repository: options, shallow: true };
  }
  return options;
};

/**
 *
 */
export function cloneLogic(): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param callback
 */
export function cloneLogic(
  callback: (helpers: CloneHelpers) => void | Promise<void>,
): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param rawRepositories
 */
export function cloneLogic(
  rawRepositories:
    | (string | CloneOptions)[]
    | string
    | readonly string[]
    | CloneOptions
    | CloneOptions[],
): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param rawRepositories
 * @param callback
 */
export function cloneLogic(
  rawRepositories:
    | (string | CloneOptions)[]
    | string
    | readonly string[]
    | CloneOptions
    | CloneOptions[],
  callback: (helpers: CloneHelpers) => void | Promise<void>,
): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param rawRepositories
 * @param callback
 * @returns
 */
export function cloneLogic(
  rawRepositories?:
    | (string | CloneOptions)[]
    | string
    | readonly string[]
    | CloneOptions
    | CloneOptions[]
    | ((helpers: CloneHelpers) => void | Promise<void>),
  callback?: (helpers: CloneHelpers) => void | Promise<void>,
) {
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
            await memoizedCloneRepo(id, {
              repositoryUrl: repository,
              branch,
              shallow,
              extraName: String(index),
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

type CloneHelpers = typeof cloneHelpers;
