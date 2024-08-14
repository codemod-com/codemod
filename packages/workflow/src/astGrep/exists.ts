import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

/**
 * @description Returns true if astGrep found at least one node that matches the given query.
 * @example
 * ```ts
 * // Check if there is at least one console.log in the code
 * const areConsoleLogExist = await astGrep`console.log($$$A)`
 *   .exists()
 * ```
 */
export function existsLogic(): Promise<boolean> {
  let result = false;
  return new FunctionExecutor("exists")
    .executor(async (next, self) => {
      result = true;
      await next?.();
    })
    .return(() => result)
    .run();
}

export const exists = fnWrapper("exists", existsLogic);
