import jscodeshift, { type FileInfo, type API, type Parser } from "jscodeshift";
import { defaultJSCodeshiftParser } from "./parser.js";

/**
 * Builds a jscodeshift API object with a custom parser.
 *
 * @param parser - An optional custom parser to use with jscodeshift. If not provided, the default JSCodeshift parser will be used.
 * @returns A jscodeshift API object with the specified parser.
 */
export const buildApi = (parser?: string | Parser): API => ({
  j: jscodeshift.withParser(parser ?? defaultJSCodeshiftParser),
  jscodeshift: jscodeshift.withParser(parser ?? defaultJSCodeshiftParser),
  stats: () => {
    console.error(
      "The stats function was called, which is not supported on purpose",
    );
  },
  report: () => {
    console.error(
      "The report function was called, which is not supported on purpose",
    );
  },
});

/**
 * Builds a jscodeshift root collection from the provided file and API.
 *
 * @param file - The FileInfo object containing the source code.
 * @param api - The jscodeshift API object.
 * @returns An object containing the jscodeshift instance and the root collection.
 */
export const buildRootCollection = (file: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  return { j, root };
};
