import { getAstGrepNodeContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

export function existsLogic(): Promise<boolean> {
  let result = false;
  return new FunctionExecutor("exists")
    .helpers(helpers)
    .executor(async (next, self) => {
      result = true;
      await next?.();
    })
    .return(() => result)
    .run();
}

export const exists = fnWrapper("exists", existsLogic);

const helpers = {
  getNode: () => getAstGrepNodeContext().node,
  getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
  getMultipleMatches: (m: string) =>
    getAstGrepNodeContext().node.getMultipleMatches(m),
};

type Helpers = typeof helpers;
