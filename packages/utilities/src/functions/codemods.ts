import { glob } from "glob";

import type { CodemodConfig } from "../schemata/codemod-config.js";
import { doubleQuotify } from "./formatting.js";

export const getEntryPath = async (options: {
  codemodRc: CodemodConfig;
  source: string;
}) => {
  const { codemodRc, source } = options;

  let globPattern: string;

  switch (codemodRc.engine) {
    case "ast-grep":
      globPattern = "**/rule.yaml";
      break;
    default:
      globPattern = "src/index.{ts,js}";
      break;
  }

  const errorText = codemodRc.entry
    ? `Make sure the entry point path under ${doubleQuotify("entry")} key is correct in .codemodrc.json`
    : `Could not find an entry point under ${doubleQuotify(globPattern)}. Either create it or provide a path at ${doubleQuotify("entry")} key in .codemodrc.json`;

  const globResult = await glob(codemodRc.entry ?? globPattern, {
    absolute: true,
    cwd: source,
    nodir: true,
  });

  return { path: globResult.at(0) ?? null, error: errorText };
};
