import { glob } from "glob";
import type { CodemodConfig } from "#schemata/codemodConfigSchema.js";
import { doubleQuotify } from "./formatting.js";

export const extractMainScriptPath = async (options: {
  codemodRc: CodemodConfig;
  source: string;
}) => {
  const { codemodRc, source } = options;

  let globPattern: string;
  let errorText: string;

  switch (codemodRc.engine) {
    case "ast-grep":
      globPattern = "**/rule.yaml";
      errorText = `Please create the main ${doubleQuotify("rule.yaml")} file first.`;
      break;
    default:
      globPattern = "src/index.{ts,js}";
      errorText = codemodRc.entry
        ? `Make sure the entry point path under ${doubleQuotify("entry")} key is correct in .codemodrc.json`
        : `Could not find an entry point under ${doubleQuotify("src/index.{ts,js}")}. Either create it or provide a path at ${doubleQuotify("entry")} key in .codemodrc.json`;
      break;
  }

  const globResult = await glob(codemodRc.entry ?? globPattern, {
    absolute: true,
    cwd: source,
    nodir: true,
  });

  return { path: globResult.at(0) ?? null, error: errorText };
};
