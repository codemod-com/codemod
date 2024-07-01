import { getCwdContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

export function mapLogic<
  CALLBACK extends (helpers: Helpers) => ReturnType<CALLBACK>,
  RETURN extends ReturnType<CALLBACK>,
>(callback: CALLBACK): Promise<RETURN[]> {
  const response = [] as RETURN[];
  return new FunctionExecutor("map")
    .helpers(helpers)
    .executor(async () => {
      const result = await callback(helpers);
      response.push(result as any);
    })
    .return(() => response)
    .run();
}

export const map = fnWrapper("map", mapLogic);

const helpers = {
  cwd: () => getCwdContext().cwd,
};

type Helpers = typeof helpers;
