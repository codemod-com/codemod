import * as fs from "node:fs/promises";
import { tsx as astGrepTsx } from "@ast-grep/napi";
import { mapValues } from "lodash";
import { PLazy } from "./PLazy.js";
import {
  astGrepNodeContext,
  getAstGrepNodeContext,
  getFileContext,
} from "./contexts.js";
import { noContextFn } from "./helpers.js";
import type { MapChildren } from "./helpers.js";
import { parseRepositories } from "./helpers.js";
import { clc } from "./helpers.js";

export const constructAstGrep =
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
    queryOrCallback: string | Readonly<string[]> | CALLBACK,
    maybeCallback?: CALLBACK,
  ) => {
    const query = queryOrCallback;
    const callback =
      typeof queryOrCallback === "function" ? queryOrCallback : maybeCallback;
    // TODO fix query argument
    const grep = parseRepositories(query).join("");

    const context = async (cb: any) => {
      await parentContext(async () => {
        const { file } = getFileContext();
        const contents = (await fs.readFile(file)).toString();
        const ast = astGrepTsx.parse(contents);
        const root = ast.root();
        const nodes = root.findAll(grep);
        for (const node of nodes) {
          if (cb) {
            await astGrepNodeContext.run(
              { node, contents },
              cb,
              callback ? helpersWithoutWrapper : helpers,
            );
          }
        }
      });

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

export const constructReplaceWith =
  <
    KEY extends keyof CHILDREN,
    CHILDREN extends {
      [k in KEY]: CHILDREN[KEY];
    },
    HELPERS extends MapChildren<CHILDREN>,
  >(
    children: CHILDREN,
  ) =>
  (parentContext: (...args: any[]) => any = noContextFn) =>
  (query: string | Readonly<string[]>) => {
    const replacement = typeof query === "string" ? query : query.join("");

    const context = async () => {
      await parentContext(async () => {
        const { node, contents } = getAstGrepNodeContext();
        if (node) {
          const text = replacement.replace(
            /(\$\$)?\$([A-Z]+)/,
            // @ts-ignore
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
      children,
      (value) =>
        (...args: any[]) =>
          value(context)(...args),
    );

    const promise = new PLazy<HELPERS>((resolve, reject) => {
      context()
        .then(resolve as any)
        .catch(reject);
    }) as PLazy<HELPERS> & HELPERS;

    Object.keys(helpers).forEach((key) => {
      // @ts-ignore
      promise[key] = helpers[key];
    });

    return promise;
  };
