import type { PLazy } from "../PLazy.js";
import { getAstGrepNodeContext, getFileContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { map } from "./map.js";

const callbackHelpers = {
  getNode: () => getAstGrepNodeContext().node,
  getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
  getMultipleMatches: (m: string) =>
    getAstGrepNodeContext().node.getMultipleMatches(m),
};

export function replaceLogic(
  callback: (
    helpers: typeof callbackHelpers,
  ) => Promise<string | undefined> | string | undefined,
): PLazy<Helpers> & Helpers;
export function replaceLogic(
  rawReplacement: string | Readonly<string[]>,
): PLazy<Helpers> & Helpers;
export function replaceLogic(
  replacementOrCallback:
    | string
    | Readonly<string[]>
    | ((
        helpers: typeof callbackHelpers,
      ) => Promise<string | undefined> | string | undefined),
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("replace")
    .arguments(() => {
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

      return { replacement, callback };
    })
    .helpers(() => helpers)
    .return((self) => self.wrappedHelpers())
    .executor(async (_next, self) => {
      const fileContext = getFileContext();
      const { node } = getAstGrepNodeContext();
      let { callback, replacement } = self.getArguments();
      if (callback) {
        replacement = await callback(self.wrapHelpers(callbackHelpers));
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

        await fileContext.update({
          start: range.start.index,
          end: range.end.index,
          replacement: text,
        });
      }
    })
    .run();
}

export const replace = fnWrapper("replace", replaceLogic);

const helpers = { map };

type Helpers = typeof helpers;
