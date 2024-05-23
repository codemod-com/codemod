import { PLazy } from "../PLazy.js";
import { getAstGrepNodeContext, getParentContext } from "../contexts.js";
import { wrapHelpers } from "../helpers.js";

const helpers = {
  getNode: () => getAstGrepNodeContext().node,
  getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
  getMultipleMatches: (m: string) =>
    getAstGrepNodeContext().node.getMultipleMatches(m),
};

type Helpers = typeof helpers;

export function map<
  CALLBACK extends (helpers: Helpers) => ReturnType<CALLBACK>,
  RETURN extends ReturnType<CALLBACK>,
>(callback: CALLBACK): Promise<RETURN[]> {
  const innerParentContext = getParentContext();

  const context = async (cb: any) => {
    const response = [] as RETURN[];

    await innerParentContext(async () => {
      const result = await cb(wrapHelpers(helpers, context));
      response.push(result);
      return result;
    });

    return response;
  };

  const promise = new PLazy<RETURN[]>((resolve, reject) => {
    context(callback).then(resolve).catch(reject);
  }) as PLazy<RETURN[]>;

  return promise;
}
