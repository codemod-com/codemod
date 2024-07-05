import { getAstGrepNodeContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

export function mapLogic<
  CALLBACK extends (helpers: Helpers) => ReturnType<CALLBACK>,
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

type Helpers = typeof helpers;
