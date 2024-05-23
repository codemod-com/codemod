import * as fs from "node:fs/promises";
import { PLazy } from "../PLazy.js";
import {
  getAstGrepNodeContext,
  getFileContext,
  getParentContext,
} from "../contexts.js";
import { clc, wrapHelpers } from "../helpers.js";
import { map } from "./map.js";

const callbackHelpers = {
  getNode: () => getAstGrepNodeContext().node,
  getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
  getMultipleMatches: (m: string) =>
    getAstGrepNodeContext().node.getMultipleMatches(m),
};

const helpers = { map };

type Helpers = typeof helpers;

export function replace(
  callback: (
    helpers: typeof callbackHelpers,
  ) => Promise<string | undefined> | string | undefined,
): PLazy<Helpers> & Helpers;
export function replace(
  rawReplacement: string | Readonly<string[]>,
): PLazy<Helpers> & Helpers;
export function replace(
  replacementOrCallback:
    | string
    | Readonly<string[]>
    | ((
        helpers: typeof callbackHelpers,
      ) => Promise<string | undefined> | string | undefined),
): PLazy<Helpers> & Helpers {
  const innerParentContext = getParentContext();

  let replacement: string | undefined;
  if (typeof replacementOrCallback === "string") {
    replacement = replacementOrCallback;
  } else if (Array.isArray(replacementOrCallback)) {
    replacement = replacementOrCallback.join("");
  }

  const callback =
    typeof replacementOrCallback === "function"
      ? replacementOrCallback
      : undefined;

  const context = async (cb?: any) => {
    await innerParentContext(async () => {
      const { node, contents } = getAstGrepNodeContext();

      if (callback) {
        replacement = await callback(wrapHelpers(callbackHelpers, context));
      }

      if (replacement) {
        const text = replacement.replace(
          /(\$\$)?\$([A-Z]+)/gm,
          // @ts-ignore
          (match, isMultiMatch, varName) => {
            if (isMultiMatch) {
              return node
                ?.getMultipleMatches(varName)
                .map((n) => n.text())
                .join(" ");
            }

            return node.getMatch(varName)?.text() || "";
          },
        );

        const range = node.range();

        const transformed =
          contents.substring(0, range.start.index) +
          text +
          contents.substring(range.end.index || 0);

        const { file } = getFileContext();
        getAstGrepNodeContext().contents = transformed;

        await fs.writeFile(file, transformed);
        console.log(
          `${clc.blueBright("FILE")} ${file}:${range.start.line + 1}:${
            range.start.column + 1
          }\n  ${clc.red(node.text())}\n  ${clc.green(text)}`,
        );
      }
    });

    if (cb) {
      await innerParentContext(() => cb());
    }

    return helpersWithContext;
  };

  const helpersWithContext = wrapHelpers(helpers, context);

  const promise = new PLazy<Helpers>((resolve, reject) => {
    context().then(resolve).catch(reject);
  }) as PLazy<Helpers> & Helpers;

  Object.keys(helpersWithContext).forEach((key) => {
    // @ts-ignore
    promise[key] = helpersWithContext[key];
  });

  return promise;
}
