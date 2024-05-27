import { PLazy } from "../PLazy.js";
import { getAstGrepNodeContext, getParentContext } from "../contexts.js";
import { wrapHelpers } from "../helpers.js";
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
      const { node } = getAstGrepNodeContext();

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

        getAstGrepNodeContext().contents.update(
          range.start.index,
          range.end.index,
          text,
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
