import * as childProcess from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as util from "node:util";
import { Lang, type NapiConfig, SgNode, parse } from "@ast-grep/napi";
import * as YAML from "yaml";
import type { PLazy } from "../PLazy.js";
import { ai } from "../ai/ai.js";
import {
  type AstGrepNodeContext,
  astGrepNodeContext,
  getFileContext,
} from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { clc } from "../helpers.js";
import { exists } from "./exists.js";
import { filter } from "./filter.js";
import { map } from "./map.js";
import { replace } from "./replace.js";

export { SgNode };

const fileExtensionToLang: Record<string, Lang> = {
  css: Lang.Css,
  html: Lang.Html,
  js: Lang.JavaScript,
  jsx: Lang.JavaScript,
  mjs: Lang.JavaScript,
  mts: Lang.TypeScript,
  cjs: Lang.JavaScript,
  cts: Lang.TypeScript,
  ts: Lang.TypeScript,
  "d.ts": Lang.TypeScript,
  tsx: Lang.Tsx,
  sh: Lang.Bash,
  c: Lang.C,
  h: Lang.C,
  cpp: Lang.Cpp,
  hpp: Lang.Cpp,
  cs: Lang.CSharp,
  dart: Lang.Dart,
  ex: Lang.Elixir,
  exs: Lang.Elixir,
  go: Lang.Go,
  java: Lang.Java,
  json: Lang.Json,
  kt: Lang.Kotlin,
  lua: Lang.Lua,
  php: Lang.Php,
  py: Lang.Python,
  py3: Lang.Python,
  rb: Lang.Ruby,
  rs: Lang.Rust,
  scala: Lang.Scala,
  swift: Lang.Swift,
  // TODO: remove after will be supported in ast-grep
  // @ts-ignore
  sql: Lang.Sql,
  // @ts-ignore
  psql: Lang.Sql,
  // @ts-ignore
  mysql: Lang.Sql,
};

type AstGrepPattern =
  | string
  | {
      selector: string;
      context: string;
      strictness?: "cst" | "smart" | "ast" | "relaxed" | "signature";
    };
type AstGrepStopBy = "end" | "neighbour" | AstGrepInsideRule;
type AstGrepInsideRule = {
  pattern: AstGrepPattern;
  stopBy?: AstGrepStopBy;
  field?: string;
};
type AstGrepHasRule = {
  kind: string;
  stopBy?: AstGrepStopBy;
  field?: string;
};
type AstGrepSiblingRule = {
  kind: string;
  stopBy?: AstGrepStopBy;
};
type AstGrepAtomicRule = {
  pattern: AstGrepPattern;
  kind?: string;
  regex?: string;
  inside?: AstGrepInsideRule;
  has?: AstGrepHasRule;
  precedes?: AstGrepSiblingRule;
  follows?: AstGrepSiblingRule;
};
type AstGrepAllRule = {
  all: AstGrepRules[];
};
type AstGrepAnyRule = {
  any: AstGrepRules[];
};
type AstGrepNotRule = {
  not: AstGrepRules;
};
type AstGrepMatchRule = {
  match: string;
};
type AstGrepRules =
  | AstGrepAtomicRule
  | AstGrepAllRule
  | AstGrepAnyRule
  | AstGrepNotRule
  | AstGrepMatchRule;

type AstGrepAPI = {
  id: string;
  language:
    | "Bash"
    | "C"
    | "Cpp"
    | "CSharp"
    | "Css"
    | "Dart"
    | "Elixir"
    | "Go"
    | "Html"
    | "Java"
    | "JavaScript"
    | "Json"
    | "Kotlin"
    | "Lua"
    | "Php"
    | "Python"
    | "Ruby"
    | "Rust"
    | "Scala"
    | "Swift"
    | "TypeScript"
    | "Tsx";
  rule: AstGrepRules;
  utils?: any;
  fix?: any;
};

const execFile = util.promisify(childProcess.execFile);

const runExternalAstGrepRule = async (rule: any, filepath: string) => {
  const packageJsonFilepath = require.resolve("@ast-grep/cli/package.json");
  const { bin: binaries } = JSON.parse(
    await fs.readFile(packageJsonFilepath, "utf-8"),
  );
  const binaryPath = path.join(
    path.dirname(require.resolve("@ast-grep/cli/package.json")),
    binaries.sg,
  );
  await execFile(binaryPath, [
    "scan",
    "--update-all",
    "--inline-rules",
    JSON.stringify(rule),
    filepath,
  ]);
};

export type AstGrepHelpers = typeof astGrepHelpers;
export type AstGrepAPIHelpers = typeof astGrepAPIHelpers;

/**
 * @description Search for a pattern in the file using [ast-grep](https://ast-grep.github.io/). There are 2 ways to use this function: controlled and uncontrolled. If you will provide `id` in the `query` object - it will be passed to ast-grep CLI (`uncontrolled` mode). In all other cases `controlled` mode will be used with Napi (Node.js bindings to Rust).
 * @param query It could be a string, string literal, [NapiConfig object](https://ast-grep.github.io/reference/api.html#napiconfig)
 * @example
 * ```ts
 * // Pass parameter as string
 * await astGrep("import React from 'react'")
 * ```
 * @example
 * ```ts
 * // Pass parameter as string literal
 * await astGrep`import React from 'react'`
 * ```
 * @example
 * ```ts
 * // Pass parameter as NapiConfig
 * await astGrep({
 *   rule: {
 *     pattern: {
 *       context: "import React from 'react'",
 *       strictness: "relaxed",
 *     },
 *   },
 * })
 * ```
 * @example
 * ```ts
 * // Pass parameter as YAML string literal
 * await astGrep`
 *   rule:
 *     pattern:
 *       context: "import React from 'react'"
 *       strictness: "relaxed"
 * `
 * ```
 * @see {@link map}
 * @see {@link filter}
 * @see {@link exists}
 * @see {@link replace}
 * @see {@link ai}
 */
export function astGrepLogic(
  query: string | readonly string[] | NapiConfig,
): ReturnType;

/**
 * @description Search for a pattern in the file using [ast-grep](https://ast-grep.github.io/). There are 2 ways to use this function: controlled and uncontrolled. If you will provide `id` in the `query` object - it will be passed to ast-grep CLI (`uncontrolled` mode). In all other cases `controlled` mode will be used with Napi (Node.js bindings to Rust).
 * @description This function is used for `uncontrolled` mode. You can chain call multiple `astGrep` functions to search for multiple patterns in the file using this mode.
 * @param query It could be a string, string literal, [NapiConfig object](https://ast-grep.github.io/reference/api.html#napiconfig)
 * @example
 * ```ts
 * // Pass directly to ast-grep CLI
 * await astGrep({
 *   id: "unique-id",
 *   rule: {
 *     pattern: {
 *       context: "import React from 'react'",
 *       strictness: "relaxed",
 *     },
 *   },
 *   fix: "import * as React from 'react'",
 * })
 * ```
 * @example
 * ```ts
 * // Chain call
 * await astGrep({
 *   id: "unique-id",
 *   rule: {
 *     pattern: {
 *       context: "import React from 'react'",
 *       strictness: "relaxed",
 *     },
 *   },
 *   fix: "import * as React from 'react'",
 * })
 *   .astGrep({
 *     id: "another-unique-id",
 *     rule: {
 *       pattern: {
 *         context: "import { useState } from 'react'",
 *         strictness: "relaxed",
 *       },
 *     },
 *     fix: "import { useRef } from 'react'",
 *   })
 * ```
 */
export function astGrepLogic(apiQuery: AstGrepAPI): ReturnTypeAPI;

/**
 * @description Search for a pattern in the file using [ast-grep](https://ast-grep.github.io/). There are 2 ways to use this function: controlled and uncontrolled. If you will provide `id` in the `query` object - it will be passed to ast-grep CLI (`uncontrolled` mode). In all other cases `controlled` mode will be used with Napi (Node.js bindings to Rust).
 * @param query It could be a string, string literal, [NapiConfig object](https://ast-grep.github.io/reference/api.html#napiconfig)
 * @param callback Function which will be called for each found node wich accepts one argument - object with helpers, which could be used to manipulate the found nodes. Callback will have all the helpers that `astGrep` returns, like `map`, `replace` etc...
 * @example
 * ```ts
 * // Use callback
 * await astGrep("console.log($$$ARGS)", async ({ map, replace }) => {
 *   console.log(`Found code occurencies: ${(await map(({ getNode }) => getNode().text())).join(", ")}`);
 *   await replace("console.error($$$ARGS)");
 * })
 * ```
 * @see {@link map}
 * @see {@link filter}
 * @see {@link exists}
 * @see {@link replace}
 * @see {@link ai}
 */
export function astGrepLogic(
  query: string | readonly string[] | NapiConfig,
  callback: (helpers: AstGrepHelpers) => Promise<void> | void,
): ReturnType;
export function astGrepLogic<
  Q extends string | readonly string[] | NapiConfig | AstGrepAPI,
  H = Q extends AstGrepAPI ? AstGrepAPIHelpers : AstGrepHelpers,
>(
  query: Q,
  callback?: (helpers: AstGrepHelpers) => Promise<void> | void,
  // @ts-ignore
): Promise<H> & H {
  return new FunctionExecutor("astGrep")
    .arguments(() => {
      let grep: string | NapiConfig | AstGrepAPI = query as string;
      if (typeof query === "object") {
        grep = Array.isArray(query)
          ? query.join("")
          : (query as NapiConfig | AstGrepAPI);
      }
      return { grep, callback };
    })
    .helpers((self) => {
      const { grep } = self.getArguments();
      if (typeof grep === "object" && "id" in grep) {
        return astGrepAPIHelpers;
      }

      return astGrepHelpers;
    })
    .return((self) => self.wrappedHelpers())
    .executor(async (next, self) => {
      const fileContext = getFileContext();
      const { grep, callback } = self.getArguments();
      let napiConfig: NapiConfig | AstGrepAPI;
      if (typeof grep === "string") {
        try {
          napiConfig = YAML.parse(grep);
        } catch (e) {
          napiConfig = {
            rule: {
              pattern: {
                context: grep,
                strictness: "relaxed",
              },
            },
          };
        }
      } else {
        napiConfig = grep;
      }

      if (typeof grep === "object" && "id" in grep) {
        await runExternalAstGrepRule(
          napiConfig as AstGrepAPI,
          fileContext.file,
        );
      } else {
        if (!fileContext.extension) {
          return;
        }
        const lang = fileExtensionToLang[fileContext.extension];
        if (!lang) {
          console.warn(
            `${clc.yellow("WARN")} Unsupported file extension: ${fileContext.extension}`,
          );
          return;
        }
        const nodes = parse(lang, await fileContext.contents())
          .root()
          .findAll(napiConfig as NapiConfig)
          .reverse();
        const astContext = { query: grep } as AstGrepNodeContext;

        for (const node of nodes) {
          if (next) {
            astContext.node = node;
            await astGrepNodeContext.run(astContext, async () => {
              await callback?.(astGrepHelpers);
              return await next();
            });
          }
        }

        await fileContext.save();
      }
    })
    .run() as any;
}

export const astGrep = fnWrapper("astGrep", astGrepLogic);

export type ReturnType = PLazy<AstGrepHelpers> & AstGrepHelpers;
export type ReturnTypeAPI = PLazy<AstGrepAPIHelpers> & AstGrepAPIHelpers;

const astGrepHelpers = {
  replace,
  map,
  ai,
  filter,
  exists,
};

const astGrepAPIHelpers = {
  astGrep,
};
