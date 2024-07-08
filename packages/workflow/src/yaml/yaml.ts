import type { PLazy } from "../PLazy.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { map } from "./map.js";
import { update } from "./update.js";

/**
 * Filter all yaml files
 */
export function yamlLogic(): PLazy<Helpers> & Helpers;
export function yamlLogic(
  callback: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers;
export function yamlLogic(
  callback?: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("yaml")
    .arguments(() => {
      return { callback };
    })
    .helpers(helpers)
    .setParentArgs({ defaultGlob: "**/*.yaml" })
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

export const yaml = fnWrapper("yaml", yamlLogic);

const helpers = { map, update };

export type Helpers = typeof helpers;
