import type { PLazy } from "../PLazy.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { map } from "./map.js";
import { update } from "./update.js";

/**
 * @description Filter all json files
 */
export function jsonLogic(): PLazy<Helpers> & Helpers;
export function jsonLogic(
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function jsonLogic(
  callback?: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("json")
    .arguments(() => {
      return { callback };
    })
    .helpers(helpers)
    .setParentArgs({ defaultGlob: "**/*.json" })
    .return((self) => self.wrappedHelpers())
    .executor(async (next, self) => {
      const { callback } = self.getArguments();

      if (callback) {
        await callback(helpers);
      }

      await next();
    })
    .run() as any;
}

export const json = fnWrapper("json", jsonLogic);

const helpers = { map, update };

export type Helpers = typeof helpers;
