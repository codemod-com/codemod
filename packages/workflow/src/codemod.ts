import type { PLazy } from "./PLazy";
import { getCwdContext } from "./contexts";
import { FunctionExecutor, fnWrapper } from "./engineHelpers";
import { exec } from "./exec";
import { files } from "./files";
import { clc } from "./helpers";
import { jsFiles } from "./jsFiles";
import { spawn } from "./spawn";

/**
 * Run a codemod in current working directory
 * @param name The name of the codemod (check for available codemods at https://codemod.com/registry)
 * @param args Arguments to pass to the codemod, e.g. `{ dry: true }`, where `dry` is a flag that the codemod accepts
 *
 * @example
 * Simple run
 * ```ts
 * await codemod("valibot/upgrade-v0.31");
 * ```
 *
 * @example
 * Run with arguments
 * ```ts
 * await codemod("valibot/upgrade-v0.31", { dry: true });
 * ```
 *
 * @example
 * Chaining codemods
 * ```ts
 * await codemod("valibot/upgrade-v0.31")
 *   .codemod("valibot/upgrade-v0.32")
 *   .codemod("valibot/upgrade-v0.33");
 * ```
 */
export function codemodLogic(
  name: string,
  args?: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >,
): PLazy<CodemodHelpers> & CodemodHelpers {
  return new FunctionExecutor("codemod")
    .arguments(() => ({
      name,
      args,
    }))
    .helpers(codemodHelpers)
    .executor(async (next, self) => {
      const { cwd } = getCwdContext();
      const args = Object.entries(self.getArguments().args ?? {}).reduce(
        (acc, [key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => acc.push(`--${key}=${v}`));
          } else {
            acc.push(`--${key}=${value}`);
          }
          return acc;
        },
        [] as string[],
      );
      console.log(
        `${clc.blueBright(`codemod ${name} ${args.join(" ")}`)} ${cwd}`,
      );
      await spawn("npx", ["codemod@latest", name, ...args], {
        cwd,
        doNotThrowError: true,
      });
      await next?.();
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const codemod = fnWrapper("codemod", codemodLogic);

const codemodHelpers = { codemod, exec, jsFiles, files };

type CodemodHelpers = typeof codemodHelpers;
