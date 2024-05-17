import { createHash } from "node:crypto";
import { mapValues } from "lodash";
import { PLazy } from "./PLazy.js";
import {
  cwdContext,
  getRepositoryContext,
  repositoriesContext,
  repositoryContext,
} from "./contexts.js";
import { cloneRepository, switchBranch } from "./git.js";
import { noContextFn } from "./helpers.js";
import type { MapChildren } from "./helpers.js";
import { parseRepositories } from "./helpers.js";

export const constructRepositories =
  <
    KEY extends keyof CHILDREN,
    CHILDREN extends {
      [k in KEY]: CHILDREN[KEY];
    },
    HELPERS extends MapChildren<CHILDREN>,
    CALLBACK extends (helpers: HELPERS) => Promise<void>,
  >(
    children: CHILDREN,
  ) =>
  // @ts-ignore
  (parentContext: (...args: any[]) => any = noContextFn) =>
  (
    reposOrCallback: string | Readonly<string[]> | CALLBACK,
    maybeCallback?: CALLBACK,
  ) => {
    const rawRepos = reposOrCallback;
    const callback =
      typeof reposOrCallback === "function" ? reposOrCallback : maybeCallback;
    const repos = parseRepositories(rawRepos);

    const context = (cb: any, info?: any) =>
      repositoriesContext.run({ repositories: repos }, async () => {
        await Promise.all(
          repos.map((repo, index) =>
            cwdContext.run({ cwd: process.cwd() }, async () => {
              const hash = createHash("sha1");
              hash.update(repo);
              if (info) {
                hash.update(info);
              }
              hash.update(String(index));
              const branch = await cloneRepository(repo, hash.digest("hex"));

              await repositoryContext.run({ repository: repo, branch }, () => {
                // Remote execution should be here
                // if (cb) {
                //   console.log('remote run:');
                //   console.log(getContextsSnapshot());
                //   console.log(cb.toString());
                // }
                return cb
                  ? cb(callback ? helpersWithoutWrapper : helpers)
                  : Promise.resolve(helpers);
              });
            }),
          ),
        );
        return helpers;
      });

    const helpers = mapValues(
      children,
      (value) =>
        (...args: any[]) =>
          value(context)(...args),
    ) as any;

    const helpersWithoutWrapper = mapValues(
      children,
      (value) =>
        (...args: any[]) =>
          value()(...args),
    );

    const promise = new PLazy((resolve, reject) => {
      if (callback) {
        context(callback)
          .then(() => resolve(helpers))
          .catch(reject);
      } else {
        context(callback).then(resolve).catch(reject);
      }
    }) as PLazy<HELPERS> & HELPERS;

    Object.keys(helpers).forEach((key) => {
      // @ts-ignore
      promise[key] = helpers[key];
    });

    return promise;
  };

export const constructBranches =
  <
    KEY extends keyof CHILDREN,
    CHILDREN extends {
      [k in KEY]: CHILDREN[KEY];
    },
    HELPERS extends MapChildren<CHILDREN>,
    CALLBACK extends (helpers: HELPERS) => Promise<void>,
  >(
    children: CHILDREN,
  ) =>
  (parentContext: (...args: any[]) => any = noContextFn) =>
  (
    branchesOrCallback: string | Readonly<string[]> | CALLBACK,
    maybeCallback?: CALLBACK,
  ) => {
    const rawBranches = branchesOrCallback;
    const callback =
      typeof branchesOrCallback === "function"
        ? branchesOrCallback
        : maybeCallback;
    const actualBranches = parseRepositories(rawBranches);

    const context = async (cb: any) => {
      await Promise.all(
        actualBranches.map((branch) =>
          parentContext(async () => {
            const repo = getRepositoryContext().repository;
            await switchBranch(branch);
            repositoryContext.run({ repository: repo, branch }, () =>
              cb
                ? cb(callback ? helpersWithoutWrapper : helpers)
                : Promise.resolve(helpers),
            );
          }, `${branch}`),
        ),
      );

      return helpers;
    };

    const helpers = mapValues(
      children,
      (value) =>
        (...args: any[]) =>
          value(context)(...args),
    ) as any;

    const helpersWithoutWrapper = mapValues(
      children,
      (value) =>
        (...args: any[]) =>
          value()(...args),
    );

    const promise = new PLazy((resolve, reject) => {
      if (callback) {
        callback(helpers)
          .then(() => resolve(helpers))
          .catch(reject);
      } else {
        context(callback).then(resolve).catch(reject);
      }
    }) as PLazy<HELPERS> & HELPERS;

    Object.keys(helpers).forEach((key) => {
      // @ts-ignore
      promise[key] = helpers[key];
    });

    return promise;
  };
