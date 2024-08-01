import jscodeshift, { type FileInfo, type API, type Parser } from "jscodeshift";
import { defaultJSCodeshiftParser } from "./parser.js";

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

export const buildRootCollection = (file: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  return { j, root };
};
