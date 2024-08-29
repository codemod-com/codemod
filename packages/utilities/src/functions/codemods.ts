import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "glob";

import {
  type CodemodConfig,
  parseCodemodConfig,
} from "../schemata/codemod-config.js";
import { doubleQuotify } from "./formatting.js";

export async function getCodemodRc(options: {
  source: string;
  throwOnNotFound: true;
}): Promise<{ config: CodemodConfig; error: null }>;
export async function getCodemodRc(options: {
  source: string;
  throwOnNotFound: false;
}): Promise<
  { config: CodemodConfig; error: null } | { config: null; error: string }
>;
export async function getCodemodRc(options: {
  source: string;
  throwOnNotFound: boolean;
}): Promise<
  { config: CodemodConfig; error: null } | { config: null; error: string }
> {
  const { source, throwOnNotFound = false } = options;

  const codemodRcContent = await readFile(join(source, ".codemodrc.json"), {
    encoding: "utf-8",
  }).catch(() => null);

  if (codemodRcContent === null) {
    const error = `Could not locate the .codemodrc.json file at ${source}`;

    if (throwOnNotFound) {
      throw new Error(error);
    }

    return { config: null, error };
  }

  let config: CodemodConfig;
  try {
    config = parseCodemodConfig(JSON.parse(codemodRcContent));
  } catch (err) {
    const error = `Failed to parse the .codemodrc.json file at ${source}`;

    if (throwOnNotFound) {
      throw new Error(error);
    }

    return { config: null, error };
  }

  return { config, error: null };
}

export async function getEntryPath(options: {
  source: string;
  throwOnNotFound: false;
}): Promise<{ path: string; error: null } | { path: null; error: string }>;
export async function getEntryPath(options: {
  source: string;
  throwOnNotFound: true;
}): Promise<{ path: string; error: null }>;
export async function getEntryPath(options: {
  source: string;
  throwOnNotFound: boolean;
}): Promise<{ path: string; error: null } | { path: null; error: string }> {
  const { source, throwOnNotFound } = options;

  const { config, error } = await getCodemodRc({
    source,
    throwOnNotFound: false,
  });

  if (config === null) {
    if (throwOnNotFound) {
      throw new Error(error);
    }

    return { path: null, error };
  }

  let globPattern: string;

  switch (config.engine) {
    case "ast-grep":
      globPattern = "**/rule.yaml";
      break;
    default:
      globPattern = "src/index.{ts,js,mts,mjs}";
      break;
  }

  const notFoundError = config.entry
    ? `Make sure the entry point path under ${doubleQuotify("entry")} key is correct in .codemodrc.json`
    : `Could not find an entry point under ${doubleQuotify(globPattern)}. Either create it or provide a path at ${doubleQuotify("entry")} key in .codemodrc.json`;

  const globResult = await glob(config.entry ?? globPattern, {
    absolute: true,
    cwd: source,
    nodir: true,
  });

  const path = globResult.at(0) ?? null;

  if (path === null) {
    if (throwOnNotFound) {
      throw new Error(notFoundError);
    }

    return { path: null, error: notFoundError };
  }

  return { path, error: null };
}
