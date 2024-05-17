import * as path from "node:path";
import * as fg from "fast-glob";
import { mapValues } from "lodash";
import { PLazy } from "./PLazy.js";
import { fileContext, getCwdContext } from "./contexts.js";
import { noContextFn } from "./helpers.js";
import type { MapChildren } from "./helpers.js";
import { parseRepositories } from "./helpers.js";

export const constructJsFiles =
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
    globsOrCallback: string | Readonly<string[]> | CALLBACK,
    maybeCallback?: CALLBACK,
  ) => {
    const rawGlobs = globsOrCallback;
    const callback =
      typeof globsOrCallback === "function" ? globsOrCallback : maybeCallback;
    const globs = parseRepositories(rawGlobs);

    const context = async (cb: any) => {
      await parentContext(() =>
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
    ) as any;

    const promise = new PLazy<HELPERS>((resolve, reject) => {
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
