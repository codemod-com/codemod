import type { PLazy } from "../PLazy.js";
import { ai } from "../ai/ai.js";
import { getAstGrepNodeContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { exists } from "./exists.js";
import { map } from "./map.js";
import { replace } from "./replace.js";

const callbackHelpers = {
  getNode: () => getAstGrepNodeContext().node,
  getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
  getMultipleMatches: (m: string) =>
    getAstGrepNodeContext().node.getMultipleMatches(m),
};

export type CallbackHelpers = typeof callbackHelpers;

export type FilterReturn = PLazy<Helpers> & Helpers;

/**
 * @description Filter the nodes found with astGrep using callback function. If function returns true - node will be included in the result, otherwise - excluded.
 * @param callback - Callback function that will be executed for each node found with astGrep. If function returns true - node will be included in the result, otherwise - excluded.
 * @example
 * ```ts
 * // Replace all console.log calls with "2" where the first argument is "1"
 * await astGrep`console.log($A)`
 *   .filter(({ getMatch }) => getMatch("A") === "1")
 *   .replace`console.log(2)`
 * ```
 * @see {@link map}
 * @see {@link replace}
 * @see {@link filter}
 * @see {@link exists}
 * @see {@link ai}
 */
export function filterLogic(
  callback: (helpers: CallbackHelpers) => Promise<boolean> | boolean,
): FilterReturn {
  return new FunctionExecutor("replace")
    .arguments(() => {
      return { callback };
    })
    .helpers(() => helpers)
    .return((self) => self.wrappedHelpers())
    .executor(async (next, self) => {
      const { callback } = self.getArguments();
      if (await callback(self.wrapHelpers(callbackHelpers))) {
        await next();
      }
    })
    .run();
}

export const filter = fnWrapper("filter", filterLogic);

const helpers = { map, filter, replace, ai, exists };

type Helpers = typeof helpers;
