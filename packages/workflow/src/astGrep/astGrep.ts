import * as fs from "node:fs/promises";
import { type NapiConfig, tsx as astGrepTsx } from "@ast-grep/napi";
import { PLazy } from "../PLazy.js";
import {
  type AstGrepNodeContext,
  astGrepNodeContext,
  getFileContext,
  getParentContext,
} from "../contexts.js";
import { wrapHelpers } from "../helpers.js";
import { map } from "./map.js";
import { replace } from "./replace.js";

const astGrepHelpers = {
  replace,
  map,
};

type AstGrepHelpers = typeof astGrepHelpers;

/**
 *
 * @param query Some description here
 * @example
 * ### Pass parameter as string
 * ```ts
 *   await astGrep("import React from 'react'");
 * ```
 * @example
 * ```ts
 *   await astGrep`import React from 'react'`;
 * ```
 * @example asdasd
 * ### Pass parameter as NapiConfig [see ast-grep documentation](https://ast-grep.github.io/guide/rule-config.html)
 * ```ts
 *   await astGrep`import React from 'react'`;
 * ```
 */

export function astGrep(
  query: string | readonly string[] | NapiConfig,
): PLazy<AstGrepHelpers> & AstGrepHelpers;
/**
 *
 * @param query
 * @param callback
 * @example
 * ```ts
 *   await astGrep("import React from 'react'", ({ astGrep }) => {
 *     astGrep("import React from 'react'");
 *   });
 * ```
 */
export function astGrep(
  query: string | readonly string[] | NapiConfig,
  callback: (helpers: AstGrepHelpers) => Promise<void> | void,
): PLazy<AstGrepHelpers> & AstGrepHelpers;
export function astGrep(
  query: string | readonly string[] | NapiConfig,
  callback?: (helpers: AstGrepHelpers) => Promise<void> | void,
) {
  const innerParentContext = getParentContext();

  let grep: string | NapiConfig = query as string;
  if (typeof query === "object") {
    grep = Array.isArray(query) ? query.join("") : (query as NapiConfig);
  }

  const context = async (cb?: any) => {
    await innerParentContext(async () => {
      const { file } = getFileContext();
      const contents = await fs.readFile(file, { encoding: "utf-8" });

      const nodes = astGrepTsx.parse(contents).root().findAll(grep);
      const astContext = { contents } as AstGrepNodeContext;

      for (const node of nodes) {
        if (cb) {
          astContext.node = node;
          await astGrepNodeContext.run(
            astContext,
            cb,
            callback ? astGrepHelpers : wrapHelpers(astGrepHelpers, context),
          );
        }
      }
    });

    return wrapHelpers(astGrepHelpers, context);
  };

  const helpers = wrapHelpers(astGrepHelpers, context);

  const promise = new PLazy<AstGrepHelpers>((resolve, reject) => {
    if (callback) {
      const voidOrPromise = context(callback);
      if (voidOrPromise instanceof Promise) {
        voidOrPromise
          .then(() => resolve(wrapHelpers(astGrepHelpers, context)))
          .catch(reject);
      }
    } else {
      context().then(resolve).catch(reject);
    }
  }) as PLazy<AstGrepHelpers> & AstGrepHelpers;

  Object.keys(helpers).forEach((key) => {
    // @ts-ignore
    promise[key] = helpers[key];
  });

  return promise;
}
