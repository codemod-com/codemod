import * as path from "node:path";
import * as fg from "fast-glob";
import { PLazy } from "./PLazy.js";
import { astGrep } from "./astGrep/astGrep.js";
import { fileContext, getCwdContext, getParentContext } from "./contexts.js";
import { parseMultistring, wrapHelpers } from "./helpers.js";

const helpers = { astGrep };

type Helpers = typeof helpers;

/**
 * @description Filter file by glob pattern
 * @param globs string or array of globs to search for a files, could be comma/space separated string
 * @example
 * ```ts
 *   await jsFiles('src/app.ts,src/**∕*.tsx').astGrep`import React from 'react'`;
 * ```
 */
export function jsFiles(
  globs: string | readonly string[],
): PLazy<Helpers> & Helpers;
export function jsFiles(
  globs: string | readonly string[],
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsFiles(
  rawGlobs: string | readonly string[],
  callback?: (helpers: Helpers) => void | Promise<void>,
) {
  const innerParentContext = getParentContext();

  const globs = parseMultistring(rawGlobs);

  const context = async (cb?: any) => {
    await innerParentContext(() =>
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
                helpers,
              );
            }
          }

          return Promise.resolve(wrapHelpers(helpers, context));
        }),
      ),
    );

    return wrapHelpers(helpers, context);
  };

  const helpersWithContext = wrapHelpers(helpers, context);

  const promise = new PLazy<Helpers>((resolve, reject) => {
    if (callback) {
      const voidOrPromise = context(callback);
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
