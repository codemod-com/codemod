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

export type CallbackHelpers = typeof callbackHelpers;

export type ReplaceReturn = PLazy<Helpers> & Helpers;

/**
 * @description Replace every found with astGrep node with the replacement string (or template literal). String can contain single match or multiple matches.
 * @param replacement The replacement string or template literal
 * @example
 * ```ts
 * // Replace every console.log with remove message
 * await astGrep`console.log($$$A)`
 *   .replace('∕* removed console.log *∕')
 * ```
 * @example
 * ```ts
 * // Replace every console.log with console.error
 * await astGrep`console.log($$$A)`
 *   .replace`console.error($$$A)`
 * ```
 */
export function replaceLogic(
  rawReplacement: string | Readonly<string[]>,
): ReplaceReturn;

/**
 * @description Replace every found with astGrep node with the replacement string (or template literal) using callback.
 * @param callback The callback function that returns the replacement string or template literal. First argument is the helpers object, which has getNode, getMatch and getMultipleMatches functions.
 * @example
 * ```ts
 * // Replace every console.log with remove message
 * await astGrep`console.log($$$A)`
 *   .replace(({ getMultipleMatches }) =>
 *     `console.error(${getMultipleMatches('A').join(', ')}`)
 * ```
 */
export function replaceLogic(
  callback: (
    helpers: CallbackHelpers,
  ) => Promise<string | undefined> | string | undefined,
): ReplaceReturn;
export function replaceLogic(
  replacementOrCallback:
    | string
    | Readonly<string[]>
    | ((
        helpers: CallbackHelpers,
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

export type Helpers = typeof helpers;
