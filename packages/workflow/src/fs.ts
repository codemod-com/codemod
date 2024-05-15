/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as fg from "fast-glob";
import { mapValues } from "lodash";
import { PLazy } from "./PLazy";
import { cwdContext, fileContext, getCwdContext } from "./contexts";

const DIRECTORY = "cm";

const filenamify = async (a: string) => {
  const module =
    // biome-ignore lint/security/noGlobalEval: <explanation>
    ((await eval('import("filenamify")')) as typeof import("filenamify"))
      .default;
  return module(a);
};

const slugify = async (a: string) => {
  type Slugiy = typeof import("@sindresorhus/slugify");
  // biome-ignore lint/security/noGlobalEval: <explanation>
  const module = ((await eval('import("@sindresorhus/slugify")')) as Slugiy)
    .default;
  return module(a);
};

export const getTmpDir = async (...rawParts: string[]) => {
  const parts = await Promise.all(
    rawParts.map(async (part) => {
      const slug = await slugify(part);
      return await filenamify(slug);
    }),
  );
  const dirpath = path.join(os.tmpdir(), DIRECTORY, ...parts);

  return dirpath;
};

export const rm = async (dir: string) => {
  await fs.rm(dir, {
    recursive: true,
    force: true,
    retryDelay: 1000,
    maxRetries: 5,
  });
};

/**
 * @description Run a callback for each directory matching the pattern
 * @param pattern Glob pattern or array of glob patterns
 * @param cb
 * @example directories`apps`
 *            .jsFiles`*.ts`
 *            .astGrep`import React from 'react'`
 *            .remove();
 * @example directories('apps/*', async ({ jsFiles }) => {
 *            await jsFiles`*.ts`
 *              .astGrep`import React from 'react'`
 *              .remove();
 *          });
 * @example directories(async ({ jsFiles }) => {
 *            await jsFiles`*.ts`
 *              .astGrep`import React from 'react'`
 *              .remove();
 *          });
 */
export const directories = async (
  pattern: string | string[],
  cb: () => Promise<void>,
) => {
  const { cwd } = getCwdContext();
  const dirs = await fg.glob(pattern, { cwd, onlyDirectories: true });
  // await Promise.all(
  //   dirs.map((dir) => cwdContext.run({ cwd: path.join(cwd, dir) }, cb))
  // );
  for (const dir of dirs) {
    await cwdContext.run({ cwd: path.join(cwd, dir) }, cb);
  }
};

export const files = async (
  pattern: string | string[],
  cb: () => Promise<void>,
) => {
  const { cwd } = getCwdContext();
  const files = await fg.glob(pattern, { cwd, onlyFiles: true });
  // console.log({ files });
  // await Promise.all(
  //   files.map((file) => fileContext.run({ file: path.join(cwd, file) }, cb))
  // );
  for (const file of files) {
    await fileContext.run({ file: path.join(cwd, file) }, cb);
  }
};

export const jsonFiles = async <T>(
  pattern: string | string[],
  cb: (args: {
    update: (updater: T | ((input: T) => T | Promise<T>)) => Promise<void>;
  }) => Promise<void>,
) => {
  const { cwd } = getCwdContext();
  const files = await fg.glob(pattern, { cwd, onlyFiles: true });
  await cb({
    update: async (updater: T | ((input: T) => T | Promise<T>)) => {
      // await Promise.all(
      //   files.map(async (file) => {
      //     const filepath = path.join(cwd, file);
      //     if (typeof updater === 'function') {
      //       const contents = JSON.parse(await fs.readFile(filepath, 'utf-8'));
      //       // @ts-ignore
      //       const updatedContents = (await updater(contents)) as T;
      //       await fs.writeFile(
      //         filepath,
      //         JSON.stringify(updatedContents, null, 2)
      //       );
      //     } else {
      //       await fs.writeFile(filepath, JSON.stringify(updater, null, 2));
      //     }
      //   })
      // );
      for (const file of files) {
        const filepath = path.join(cwd, file);
        if (typeof updater === "function") {
          const contents = JSON.parse(await fs.readFile(filepath, "utf-8"));
          // @ts-ignore
          const updatedContents = (await updater(contents)) as T;
          await fs.writeFile(
            filepath,
            JSON.stringify(updatedContents, null, 2),
          );
        } else {
          await fs.writeFile(filepath, JSON.stringify(updater, null, 2));
        }
      }
    },
  });
};

// export const jsFiles = async <T>(
//   pattern: string | string[],
//   cb: (args: {
//     update: (updater: T | ((input: T) => T | Promise<T>)) => Promise<void>;
//   }) => Promise<void>
// ) => {
//   const { cwd } = getCwdContext();
//   const files = await fg.glob(pattern, { cwd, onlyFiles: true });
//   await cb({
//     astGrep: async (updater: T | ((input: T) => T | Promise<T>)) => {
//       for (const file of files) {
//         const filepath = path.join(cwd, file);
//         if (typeof updater === 'function') {
//           const contents = JSON.parse(await fs.readFile(filepath, 'utf-8'));
//           // @ts-ignore
//           const updatedContents = (await updater(contents)) as T;
//           await fs.writeFile(
//             filepath,
//             JSON.stringify(updatedContents, null, 2)
//           );
//         } else {
//           await fs.writeFile(filepath, JSON.stringify(updater, null, 2));
//         }
//       }
//     },
//   });
// };

export const isDirectory = async (dir: string) => {
  try {
    const stats = await fs.stat(dir);
    await fs.access(
      dir,
      fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK,
    );
    return stats.isDirectory();
  } catch {
    return false;
  }
};

// const noContextFn = <T extends (...args: any) => ReturnType<T>>(cb: T) => cb();

// export const constructJsFiles =
//   (children) =>
//   (context = noContextFn) =>
//   (globsOrCallback, maybeCallback) => {
//     const rawGlobs = globsOrCallback;
//     const callback =
//       typeof globsOrCallback === "function" ? globsOrCallback : maybeCallback;
//     const globs = parseRepositories(rawGlobs);

//     const wrapWithContextAndReturnPromise = async (cb) => {
//       await context(() =>
//         Promise.all(
//           globs.map(async (glob) => {
//             const { cwd } = getCwdContext();
//             const files = await fg.glob(glob, {
//               cwd,
//               onlyFiles: true,
//               ignore: [
//                 "**/node_modules/**",
//                 "**/.git/**",
//                 "**/dist/**",
//                 "**/build/**",
//               ],
//             });

//             if (cb) {
//               for (const file of files) {
//                 await fileContext.run(
//                   { file: path.join(cwd, file) },
//                   (...args) => {
//                     // Remote execution should be here
//                     // if (cb) {
//                     //   console.log('remote run:');
//                     //   console.log(getContextsSnapshot());
//                     //   console.log(cb.toString());
//                     // }
//                     return cb(...args);
//                   },
//                   callback ? helpersWithoutWrapper : helpers,
//                 );
//               }
//             }

//             return Promise.resolve(helpers);
//           }),
//         ),
//       );

//       return helpers;
//     };

//     const helpers = mapValues(
//       children,
//       (value) =>
//         (...args) =>
//           value(wrapWithContextAndReturnPromise)(...args),
//     );

//     const helpersWithoutWrapper = mapValues(
//       children,
//       (value) =>
//         (...args) =>
//           value()(...args),
//     );

//     const promise = new PLazy((resolve, reject) => {
//       if (callback) {
//         // This case will be lazy loading, need to revert it back later somehow
//         // For example, detect if function has arguments
//         // Revert comment for next 3 lines
//         callback(helpers)
//           .then(() => resolve(helpers))
//           .catch(reject);
//         //   console.log(callback.toString());
//         // and remove next:
//         // wrapWithContextAndReturnPromise(callback)
//         //   .then(() => resolve(helpers))
//         //   .catch(reject);
//       } else {
//         wrapWithContextAndReturnPromise(callback).then(resolve).catch(reject);
//       }
//     });

//     Object.keys(helpers).forEach((key) => {
//       promise[key] = helpers[key];
//     });

//     return promise;
//   };
