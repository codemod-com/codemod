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

export function filterLogic(
  callback: (helpers: typeof callbackHelpers) => Promise<boolean> | boolean,
): PLazy<Helpers> & Helpers;
export function filterLogic(
  callback: (helpers: typeof callbackHelpers) => Promise<boolean> | boolean,
): PLazy<Helpers> & Helpers {
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
