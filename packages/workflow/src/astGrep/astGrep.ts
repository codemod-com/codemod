import * as childProcess from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as util from "node:util";
import { type NapiConfig, tsx as astGrepTsx } from "@ast-grep/napi";
import { formatText } from "@codemod-com/utilities";
import MagicString from "magic-string";
import type { PLazy } from "../PLazy.js";
import { ai } from "../ai/ai.js";
import {
  type AstGrepNodeContext,
  astGrepNodeContext,
  getFileContext,
} from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { clc } from "../helpers.js";
import { filter } from "./filter.js";
import { map } from "./map.js";
import { replace } from "./replace.js";

type AstGrepPattern = string | { selector: string; context: string };
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

type AstGrepHelpers = typeof astGrepHelpers;
type AstGrepAPIHelpers = typeof astGrepAPIHelpers;

/**
 *
 * @param query It could be a string, string literal or NapiConfig object for ast-grep
 * @example
 * ### Pass parameter as string
 * ```ts
 *   await astGrep("import React from 'react'");
 * ```
 * @example
 * ### Pass parameter as string literal
 * ```ts
 *   await astGrep`import React from 'react'`;
 * ```
 * @example
 * ### Pass parameter as NapiConfig [see ast-grep documentation](https://ast-grep.github.io/guide/rule-config.html)
 * ```ts
 *   await astGrep`import React from 'react'`;
 * ```
 */
export function astGrepLogic(
  query: string | readonly string[] | NapiConfig,
): PLazy<AstGrepHelpers> & AstGrepHelpers;
export function astGrepLogic(
  apiQuery: AstGrepAPI,
): PLazy<AstGrepAPIHelpers> & AstGrepAPIHelpers;
/**
 *
 * @param query
 * @param callback
 * @example
 * ```ts
 *   await astGrep("import React from 'react'", ({ astGrep }) => {
 *     astGrep("import React from 'react'");
 *   });
 * ```
 */
export function astGrepLogic(
  query: string | readonly string[] | NapiConfig,
  callback: (helpers: AstGrepHelpers) => Promise<void> | void,
): PLazy<AstGrepHelpers> & AstGrepHelpers;
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
      const { file } = getFileContext();
      const { grep, callback } = self.getArguments();
      if (typeof grep === "object" && "id" in grep) {
        await runExternalAstGrepRule(grep, file);
      } else {
        const contents = await fs.readFile(file, { encoding: "utf-8" });

        const nodes = astGrepTsx.parse(contents).root().findAll(grep).reverse();
        const astContext = {
          contents: new MagicString(contents),
          query: grep,
        } as AstGrepNodeContext;

        for (const node of nodes) {
          if (next) {
            astContext.node = node;
            await astGrepNodeContext.run(
              astContext,
              next,
              callback ? astGrepHelpers : self.wrapHelpers(astGrepHelpers),
            );
          }
        }

        if (astContext.contents.hasChanged()) {
          await fs.writeFile(
            file,
            await formatText(file, astContext.contents.toString(), true),
          );
          console.log(`${clc.blueBright("FILE")} ${file}`);
        }
      }
    })
    .run() as any;
}

export const astGrep = fnWrapper("astGrep", astGrepLogic);

const astGrepHelpers = {
  replace,
  map,
  ai,
  filter,
};

const astGrepAPIHelpers = {
  astGrep,
};
