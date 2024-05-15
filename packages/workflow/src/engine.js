import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tsx as astGrepTsx } from "@ast-grep/napi";
import * as fg from "fast-glob";
import { flattenDeep, identity, mapValues } from "lodash";
import { PLazy } from "./PLazy.js";
import {
  cwdContext,
  fileContext,
  getCwdContext,
  getFileContext,
  getRepositoriesContext,
  getRepositoryContext,
  repositoriesContext,
  repositoryContext,
} from "./contexts.js";
import { cloneRepository, switchBranch } from "./git.js";
// const { tsx: astGrepTsx } = require("@ast-grep/napi");
// const path = require("node:path");
// const fg = require("fast-glob");
// const fs = require("node:fs/promises");
// const { identity, flattenDeep } = require("lodash");
// const { createHash } = require("node:crypto");
// const { PLazy } = require("./PLazy.js");
// const { cloneRepository, switchBranch } = require("./git.js");
// const {
//   cwdContext,
//   getRepositoriesContext,
//   getRepositoryContext,
//   repositoriesContext,
//   repositoryContext,
//   fileContext,
//   getCwdContext,
//   getFileContext,
//   astGrepNodeContext,
//   getAstGrepNodeContext,
//   getContextsSnapshot,
// } = require("./contexts");
// const { mapValues } = require("lodash");
// const { clc } = require("./helpers");

const parseRepositories = (repos) => {
  if (typeof repos === "string") {
    return repos
      .split(/[\n,; ]/)
      .map((repository) => repository.trim())
      .filter(identity);
  }

  if (typeof repos === "function") {
    return getRepositoriesContext().repositories;
  }

  return flattenDeep(
    repos.map((repository) =>
      repository.split(/[\n, ;]/).map((repository) => repository.trim()),
    ),
  ).filter(identity);
};

const constructPromiseAndHelpers = ({
  wrapWithContextAndReturnPromise,
  callback,
  record,
}) => {
  const helpers = mapValues(
    record,
    (value) =>
      (...args) =>
        value(wrapWithContextAndReturnPromise)(...args),
  );

  const promise = new PLazy((resolve, reject) => {
    if (callback) {
      // This case will be lazy loading, need to revert it back later somehow
      // For example, detect if function has arguments
      // Revert comment for next 3 lines
      callback(helpers)
        .then(() => resolve(helpers))
        .catch(reject);
      //   console.log(callback.toString());
      // and remove next:
      // wrapWithContextAndReturnPromise(callback)
      //   .then(() => resolve(helpers))
      //   .catch(reject);
    } else {
      wrapWithContextAndReturnPromise(callback).then(resolve).catch(reject);
    }
  });

  Object.keys(helpers).forEach((key) => {
    promise[key] = helpers[key];
  });

  return { helpers, promise };
};

const noContextFn = (cb) => cb();

const constructReplaceWith =
  (record) =>
  (context = noContextFn) =>
  (codeOrCallback, maybeCallback) => {
    const query = codeOrCallback;
    const callback =
      typeof queryOrCallback === "function" ? codeOrCallback : maybeCallback;
    // TODO fix query argument
    const replacement = typeof query === "string" ? query : query.join("");

    const wrapWithContextAndReturnPromise = async (cb) => {
      await context(async () => {
        const { node, contents } = getAstGrepNodeContext();
        if (node) {
          const text = replacement.replace(
            /(\$\$)?\$([A-Z]+)/,
            (match, isMultiMatch, varName) => {
              if (isMultiMatch) {
                return node
                  ?.getMultipleMatches(varName)
                  .map((n) => n.text())
                  .join(" ");
              }

              return node?.getMatch(varName)?.text() || "";
            },
          );
          const transformed =
            contents.substring(0, node?.range().start.index) +
            text +
            contents.substring(node?.range().end.index || 0);
          const { file } = getFileContext();
          await fs.writeFile(file, transformed);
          console.log(`${clc.blueBright("FILE")} ${file}`);
        }
      });

      return helpers;
    };

    const helpers = mapValues(
      record,
      (value) =>
        (...args) =>
          value(wrapWithContextAndReturnPromise)(...args),
    );

    const helpersWithoutWrapper = mapValues(
      record,
      (value) =>
        (...args) =>
          value()(...args),
    );

    const promise = new PLazy((resolve, reject) => {
      if (callback) {
        // This case will be lazy loading, need to revert it back later somehow
        // For example, detect if function has arguments
        // Revert comment for next 3 lines
        callback(helpers)
          .then(() => resolve(helpers))
          .catch(reject);
        //   console.log(callback.toString());
        // and remove next:
        // wrapWithContextAndReturnPromise(callback)
        //   .then(() => resolve(helpers))
        //   .catch(reject);
      } else {
        wrapWithContextAndReturnPromise(callback).then(resolve).catch(reject);
      }
    });

    Object.keys(helpers).forEach((key) => {
      promise[key] = helpers[key];
    });

    return promise;
  };

const constructAstGrep =
  (record) =>
  (context = noContextFn) =>
  (queryOrCallback, maybeCallback) => {
    const query = queryOrCallback;
    const callback =
      typeof queryOrCallback === "function" ? queryOrCallback : maybeCallback;
    // TODO fix query argument
    const grep = typeof query === "string" ? query : query.join("");

    const wrapWithContextAndReturnPromise = async (cb) => {
      await context(async () => {
        const { file } = getFileContext();
        const contents = (await fs.readFile(file)).toString();
        const ast = astGrepTsx.parse(contents);
        const root = ast.root();
        const node = root.find(grep);
        if (node && cb) {
          await astGrepNodeContext.run(
            { node, contents },
            cb,
            callback ? helpersWithoutWrapper : helpers,
          );
        }
      });

      return helpers;
    };

    const helpers = mapValues(
      record,
      (value) =>
        (...args) =>
          value(wrapWithContextAndReturnPromise)(...args),
    );

    const helpersWithoutWrapper = mapValues(
      record,
      (value) =>
        (...args) =>
          value()(...args),
    );

    const promise = new PLazy((resolve, reject) => {
      if (callback) {
        // This case will be lazy loading, need to revert it back later somehow
        // For example, detect if function has arguments
        // Revert comment for next 3 lines
        callback(helpers)
          .then(() => resolve(helpers))
          .catch(reject);
        //   console.log(callback.toString());
        // and remove next:
        // wrapWithContextAndReturnPromise(callback)
        //   .then(() => resolve(helpers))
        //   .catch(reject);
      } else {
        wrapWithContextAndReturnPromise(callback).then(resolve).catch(reject);
      }
    });

    Object.keys(helpers).forEach((key) => {
      promise[key] = helpers[key];
    });

    return promise;
  };

const constructJsFiles =
  (record) =>
  (context = noContextFn) =>
  (globsOrCallback, maybeCallback) => {
    const rawGlobs = globsOrCallback;
    const callback =
      typeof globsOrCallback === "function" ? globsOrCallback : maybeCallback;
    const globs = parseRepositories(rawGlobs);

    const wrapWithContextAndReturnPromise = async (cb) => {
      await context(() =>
        Promise.all(
          globs.map(async (glob) => {
            const { cwd } = getCwdContext();
            const files = await fg.glob(glob, {
              cwd,
              onlyFiles: true,
              ignore: [
                "**/node_modules/**",
                "**/.git/**",
                "**/dist/**",
                "**/build/**",
              ],
            });

            if (cb) {
              for (const file of files) {
                await fileContext.run(
                  { file: path.join(cwd, file) },
                  (...args) => {
                    // Remote execution should be here
                    // if (cb) {
                    //   console.log('remote run:');
                    //   console.log(getContextsSnapshot());
                    //   console.log(cb.toString());
                    // }
                    return cb(...args);
                  },
                  callback ? helpersWithoutWrapper : helpers,
                );
              }
            }

            return Promise.resolve(helpers);
          }),
        ),
      );

      return helpers;
    };

    const helpers = mapValues(
      record,
      (value) =>
        (...args) =>
          value(wrapWithContextAndReturnPromise)(...args),
    );

    const helpersWithoutWrapper = mapValues(
      record,
      (value) =>
        (...args) =>
          value()(...args),
    );

    const promise = new PLazy((resolve, reject) => {
      if (callback) {
        // This case will be lazy loading, need to revert it back later somehow
        // For example, detect if function has arguments
        // Revert comment for next 3 lines
        callback(helpers)
          .then(() => resolve(helpers))
          .catch(reject);
        //   console.log(callback.toString());
        // and remove next:
        // wrapWithContextAndReturnPromise(callback)
        //   .then(() => resolve(helpers))
        //   .catch(reject);
      } else {
        wrapWithContextAndReturnPromise(callback).then(resolve).catch(reject);
      }
    });

    Object.keys(helpers).forEach((key) => {
      promise[key] = helpers[key];
    });

    return promise;
  };

const constructBranches =
  (record) =>
  (context = noContextFn) =>
  (branchesOrCallback, maybeCallback) => {
    const rawBranches = branchesOrCallback;
    const callback =
      typeof branchesOrCallback === "function"
        ? branchesOrCallback
        : maybeCallback;
    const actualBranches = parseRepositories(rawBranches);

    const wrapWithContextAndReturnPromise = async (cb) => {
      await Promise.all(
        actualBranches.map((branch) =>
          context(async () => {
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
      record,
      (value) =>
        (...args) =>
          value(wrapWithContextAndReturnPromise)(...args),
    );

    const helpersWithoutWrapper = mapValues(
      record,
      (value) =>
        (...args) =>
          value()(...args),
    );

    const promise = new PLazy((resolve, reject) => {
      if (callback) {
        // This case will be lazy loading, need to revert it back later somehow
        // For example, detect if function has arguments
        // Revert comment for next 3 lines
        callback(helpers)
          .then(() => resolve(helpers))
          .catch(reject);
        //   console.log(callback.toString());
        // and remove next:
        // wrapWithContextAndReturnPromise(callback)
        //   .then(() => resolve(helpers))
        //   .catch(reject);
      } else {
        wrapWithContextAndReturnPromise(callback).then(resolve).catch(reject);
      }
    });

    Object.keys(helpers).forEach((key) => {
      promise[key] = helpers[key];
    });

    return promise;
  };

const constructRepositories =
  (record) =>
  (context = noContextFn) =>
  (reposOrCallback, maybeCallback) => {
    const rawRepos = reposOrCallback;
    const callback =
      typeof reposOrCallback === "function" ? reposOrCallback : maybeCallback;
    const repos = parseRepositories(rawRepos);

    const wrapWithContextAndReturnPromise = (cb, info) =>
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
      record,
      (value) =>
        (...args) =>
          value(wrapWithContextAndReturnPromise)(...args),
    );

    const helpersWithoutWrapper = mapValues(
      record,
      (value) =>
        (...args) =>
          value()(...args),
    );

    const promise = new PLazy((resolve, reject) => {
      if (callback) {
        wrapWithContextAndReturnPromise(callback)
          .then(() => resolve(helpers))
          .catch(reject);
      } else {
        wrapWithContextAndReturnPromise(callback).then(resolve).catch(reject);
      }
    });

    Object.keys(helpers).forEach((key) => {
      promise[key] = helpers[key];
    });

    return promise;
  };

const initReplaceWith = constructReplaceWith({});
const initAstGrep = constructAstGrep({ replaceWith: initReplaceWith });
const initJsFiles = constructJsFiles({ astGrep: initAstGrep });
const initBranches = constructBranches({ jsFiles: initJsFiles });

const initRepositories = constructRepositories({
  branches: initBranches,
  jsFiles: initJsFiles,
});

export const replaceWith = initReplaceWith();
export const astGrep = initAstGrep();
export const jsFiles = initJsFiles();
export const branches = initBranches();
export const repositories = initRepositories();

// (async () => {
//   // await repositories`https://github.com/codemod-com/codemod`
//   //   .branches`brach1`.jsFiles('**/*.ts', async ({ astGrep }) => {
//   //   await astGrep('console.log($A)');
//   // });
//   // await repositories`https://github.com/codemod-com/codemod`.branches`brach1`
//   //   .jsFiles`**/*.ts`.astGrep`console.log($A)`.replaceWith`console.error($A)`;
//   // const accessFromHere = await repositories(
//   //   'https://github.com/codemod-com/codemod,https://github.com/codemod-com/react-codemod',
//   //   async ({ branches }) => {
//   //     console.log('callback');
//   //     await branches('branch1, branch2');
//   //   }
//   // );
//   // await accessFromHere.branches('branch1, branch2');
//   // await repositories`https://github.com/codemod-com/codemod`.branches(
//   //   'branch1',
//   //   async ({ jsFiles }) => {
//   //     await jsFiles`**/*.ts`.astGrep`console.log($A)`
//   //       .replaceWith`console.info($A)`;
//   //   }
//   // );
//   // await repositories('https://github.com/codemod-com/codemod')
//   //   .branches('branch1')
//   //   .jsFiles('**/*.ts')
//   //   .astGrep('console.log($A)', ({ replaceWith }) =>
//   //     replaceWith('console.errt($A)')
//   //   );
//   // await repositories('https://github.com/codemod-com/codemod', async () => {
//   //   // console.log(repositoryContext.getStore());
//   //   // await jsFiles('**/*.ts', async ({ astGrep }) => {
//   //   //   await astGrep`console.log($A)`.replaceWith`console.error($A)`;
//   //   // });
//   //   // await jsFiles`**/*.ts`.astGrep`console.log($A)`
//   //   //   .replaceWith`console.test($A)`;
//   //   await jsFiles('**/*.ts', async ({ astGrep }) => {
//   //     // await astGrep`console.log($A)`.replaceWith`console.error($A)`;
//   //     await astGrep('console.log($A)', ({ replaceWith }) =>
//   //       replaceWith('console.error($A)')
//   //     );
//   //   });
//   // });
//   // await repositories`https://github.com/codemod-com/codemod`.branches`branch1`
//   //   .jsFiles`**/*.ts`.astGrep`console.log($A)`
//   //   .replaceWith`console.error($A)`;
//   await repositories`https://github.com/codemod-com/codemod`.branches`branch1`
//     .jsFiles`**/*.ts`.astGrep`console.log($A)`.replaceWith`console.error($A)`;
// })();
