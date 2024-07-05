import { buildApi } from "@codemod-com/utilities";
import type { API, FileInfo, Options } from "jscodeshift";
import type { PLazy } from "../PLazy.js";
import { getFileContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";

/**
 * Run jscodeshift codemod for files in context
 * @param callback
 */
export function jscodeshiftLogic(
  callback: (
    file: FileInfo,
    api: API,
    options: Options,
  ) => void | Promise<string> | Promise<void> | string,
): PLazy<Helpers> & Helpers {
  const api = buildApi("tsx");
  return new FunctionExecutor("jscodeshift")
    .arguments(() => ({ callback }))
    .helpers(() => helpers)
    .return((self) => self.wrappedHelpers())
    .executor(async (next, self) => {
      const { callback } = self.getArguments();
      const fileContext = getFileContext();
      const source = await fileContext.contents();

      try {
        const newData = await callback(
          { path: fileContext.file, source },
          api,
          {},
        );
        if (typeof newData === "string" && source !== newData) {
          fileContext.setContents(newData);
          await fileContext.save();
        }
      } catch (e) {
        console.error(`jscodeshift error: ${e} in ${fileContext.file}`);
      }

      await next();
    })
    .run();
}

export const jscodeshift = fnWrapper("jscodeshift", jscodeshiftLogic);

const helpers = {};

type Helpers = typeof helpers;
