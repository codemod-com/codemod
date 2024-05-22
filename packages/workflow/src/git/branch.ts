import { PLazy } from "../PLazy.js";
import {
  getParentContext,
  getRepositoryContext,
  repositoryContext,
} from "../contexts.js";
import { switchBranch } from "../git.js";
import { parseMultistring, wrapHelpers } from "../helpers.js";
import { jsFiles } from "../jsFiles.js";
import { commit } from "./commit.js";
import { push } from "./push.js";

const helpers = { jsFiles, commit, push };

type Helpers = typeof helpers;

export function branch(
  rawBranches: string | readonly string[],
): PLazy<Helpers> & Helpers;
export function branch(
  rawBranches: string | readonly string[],
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function branch(
  rawBranches: string | readonly string[],
  callback?: (helpers: Helpers) => void | Promise<void>,
) {
  const innerParentContext = getParentContext();

  const branches = parseMultistring(rawBranches);

  const context = async (cb?: any) => {
    await Promise.all(
      branches.map((branchName) =>
        innerParentContext(async () => {
          const repo = getRepositoryContext().repository;

          await switchBranch(branchName);

          await repositoryContext.run(
            { repository: repo, branch: branchName },
            () =>
              cb
                ? cb(callback ? helpers : wrapHelpers(helpers, context))
                : Promise.resolve(wrapHelpers(helpers, context)),
          );
        }, `${branch}`),
      ),
    );

    return wrapHelpers(helpers, context);
  };

  const helpersWithContext = wrapHelpers(helpers, context);

  const promise = new PLazy<Helpers>((resolve, reject) => {
    if (callback) {
      const voidOrPromise = callback(wrapHelpers(helpers, context));
      if (voidOrPromise instanceof Promise) {
        voidOrPromise
          .then(() => resolve(wrapHelpers(helpers, context)))
          .catch(reject);
      }
    } else {
      context().then(resolve).catch(reject);
    }
  }) as PLazy<Helpers> & Helpers;

  Object.keys(helpersWithContext).forEach((key) => {
    // @ts-ignore
    promise[key] = helpersWithContext[key];
  });

  return promise;
}
