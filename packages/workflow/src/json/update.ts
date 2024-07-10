import detectIndent from "detect-indent";
import { detectNewline } from "detect-newline";
import type { PLazy } from "../PLazy.js";
import { getFileContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

/**
 * Update the contents of a json file
 */
export function updateLogic<T>(
  callback: (before: T) => T | Promise<T>,
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("update")
    .helpers(helpers)
    .arguments(() => ({ callback }))
    .executor(async (next, self) => {
      const { callback } = self.getArguments();
      const file = getFileContext();
      const beforeContents = await file.contents();
      const indent = detectIndent(beforeContents).indent || "  ";
      const newline = detectNewline(beforeContents) || "\n";
      const possibleNewline = beforeContents.slice(-newline.length);
      const newlineToInsert =
        newline.localeCompare(possibleNewline) === 0 ? newline : "";
      const afterContents = await callback(JSON.parse(beforeContents));
      file.setContents(
        JSON.stringify(afterContents, null, indent).concat(newlineToInsert),
      );
      await file.save({ skipFormat: true });
      await next?.();
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const update = fnWrapper("update", updateLogic);

const helpers = {};

type Helpers = typeof helpers;
