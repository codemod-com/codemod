import { createHash } from "node:crypto";
import { memoize } from "lodash";
import { PLazy } from "../PLazy.js";
import {
  cwdContext,
  getParentContext,
  repositoriesContext,
  repositoryContext,
} from "../contexts.js";
import { cloneRepository } from "../git.js";
import { parseMultistring, wrapHelpers } from "../helpers.js";
import { jsFiles } from "../jsFiles.js";
import { branch } from "./branch.js";
import { commit } from "./commit.js";
import { push } from "./push.js";

const helpers = { jsFiles, branch, commit, push };

type Helpers = typeof helpers;

export function clone(
  rawRepositories: string | readonly string[],
): PLazy<Helpers> & Helpers;
export function clone(
  rawRepositories: string | readonly string[],
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function clone(
  rawRepositories: string | readonly string[],
  callback?: (helpers: Helpers) => void | Promise<void>,
) {
  const innerParentContext = getParentContext();

  const repositories = parseMultistring(rawRepositories);

  const localClone = memoize(async (repository: string, ...keys: any) => {
    const hash = createHash("sha1");
    hash.update(JSON.stringify(keys));
    return await cloneRepository(repository, hash.digest("hex"));
  });

  const context = async (cb?: any, info?: any) => {
    await innerParentContext(() =>
      repositoriesContext.run({ repositories }, async () => {
        await Promise.all(
          repositories.map((repository, index) =>
            cwdContext.run({ cwd: process.cwd() }, async () => {
              const branch = await localClone(repository, info, index);

              await repositoryContext.run({ repository, branch }, async () => {
                if (callback) {
                  await callback(wrapHelpers(helpers, context));
                }
                // Remote execution should be here
                // if (cb) {
                //   console.log('remote run:');
                //   console.log(getContextsSnapshot());
                //   console.log(cb.toString());
                // }
                await (cb
                  ? cb(callback ? helpers : wrapHelpers(helpers, context))
                  : Promise.resolve(wrapHelpers(helpers, context)));
              });
            }),
          ),
        );
        return wrapHelpers(helpers, context);
      }),
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
