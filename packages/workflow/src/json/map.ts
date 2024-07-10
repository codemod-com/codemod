import { getFileContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

/**
 * Map json file contents
 */
export function mapLogic<
  CALLBACK extends (helpers: Helpers) => ReturnType<CALLBACK>,
  RETURN extends ReturnType<CALLBACK>,
>(callback: CALLBACK): Promise<Awaited<RETURN>[]> {
  const response = [] as Awaited<RETURN>[];
  return new FunctionExecutor("map")
    .helpers(helpers)
    .arguments(() => ({ callback }))
    .executor(async (next, self) => {
      const { callback } = self.getArguments();
      const result = await callback(helpers);
      response.push(result as Awaited<RETURN>);
      await next?.();
    })
    .return(() => response)
    .run();
}

export const map = fnWrapper("map", mapLogic);

const helpers = {
  getContents: async <T>() =>
    JSON.parse(await getFileContext().contents()) as T,
};

type Helpers = typeof helpers;
