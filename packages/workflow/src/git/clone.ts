import type { PLazy } from "../PLazy.js";
import { codemod } from "../codemod.js";
import { cwdContext, gitContext } from "../contexts.js";
import { GitContext } from "../contexts/GitContext.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { exec } from "../exec.js";
import { files } from "../files.js";
import { dirs } from "../fs/dirs.js";
import { parseMultistring } from "../helpers.js";
import { jsFiles } from "../jsFiles.js";
import { branch } from "./branch.js";
import { commit } from "./commit.js";
import { cloneRepository } from "./helpers.js";
import { push } from "./push.js";

interface CloneOptions {
  repository: string;
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
 * @param rawRepositories
 */
export function cloneLogic(
  rawRepositories: string | readonly string[] | CloneOptions | CloneOptions[],
): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param rawRepositories
 * @param callback
 */
export function cloneLogic(
  rawRepositories: string | readonly string[] | CloneOptions | CloneOptions[],
  callback: (helpers: CloneHelpers) => void | Promise<void>,
): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param rawRepositories
 * @param callback
 * @returns
 */
export function cloneLogic(
  rawRepositories: string | readonly string[] | CloneOptions | CloneOptions[],
  callback?: (helpers: CloneHelpers) => void | Promise<void>,
) {
  return new FunctionExecutor("clone")
    .arguments(() => {
      let repositories: CloneOptions[];

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
      } else {
        repositories = [
          mapCloneOptions(rawRepositories as string | CloneOptions),
        ];
      }

      return {
        repositories,
        callback,
      };
    })
    .helpers(cloneHelpers)
    .executor(async (next, self) => {
      const { repositories } = self.getArguments();
      await Promise.all(
        repositories.map(({ repository, shallow }, index) =>
          cwdContext.run({ cwd: process.cwd() }, async () => {
            await cloneRepository({
              repositoryUrl: repository,
              extraName: String(index),
              shallow,
            });
            await gitContext.run(new GitContext({ repository }), next);
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
};

type CloneHelpers = typeof cloneHelpers;
