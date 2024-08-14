import { getAstGrepNodeContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

/**
 * @description Map each found with astGrep node and return resulting array. Could be used to retrieve some information from code.
 * @param callback - Callback function that will be called for each found node.
 * @example
 * ```ts
 * // Retrieve first argument for every console.log expression
 * await astGrep`console.log($A)`
 *   .map(({ getMatch }) => getMatch('A'))
 * ```
 */
export function mapLogic<
  CALLBACK extends (
    helpers: Helpers,
  ) => ReturnType<CALLBACK> | Promise<ReturnType<CALLBACK>>,
  RETURN extends ReturnType<CALLBACK>,
>(callback: CALLBACK): Promise<RETURN[]> {
  const response = [] as RETURN[];
  return new FunctionExecutor("map")
    .helpers(helpers)
    .arguments(() => ({ callback }))
    .executor(async (next, self) => {
      const { callback } = self.getArguments();
      const result = await callback(helpers);
      response.push(result as RETURN);
      await next?.();
    })
    .return(() => response)
    .run();
}

export const map = fnWrapper("map", mapLogic);

const helpers = {
  getNode: () => getAstGrepNodeContext().node,
  getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
  getMultipleMatches: (m: string) =>
    getAstGrepNodeContext().node.getMultipleMatches(m),
};

export type Helpers = typeof helpers;
