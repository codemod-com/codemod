import type { PLazy } from "./PLazy.js";
import { getCwdContext } from "./contexts.js";
import { FunctionExecutor, fnWrapper } from "./engineHelpers.js";
import { exec } from "./exec.js";
import { clc } from "./helpers.js";
import { spawn } from "./spawn.js";

export type CodemodReturn = PLazy<CodemodHelpers> & CodemodHelpers;

/**
 * Run a codemod in current working directory
 * @param name The name of the codemod (check for available codemods at https://codemod.com/registry)
 * @param args Arguments to pass to the codemod, e.g. `{ dry: true }`, where `dry` is a flag that the codemod accepts
 *
 * @example
 * ```ts
 * // Simple run
 * await codemod("valibot/upgrade-v0.31");
 * ```
 *
 * @example
 * ```ts
 * // Run with arguments
 * await codemod("valibot/upgrade-v0.31", { dry: true });
 * ```
 *
 * @example
 * ```ts
 * // Chaining codemods
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
): CodemodReturn {
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
        ["--no-interactive"] as string[],
      );
      console.log(
        `${clc.blueBright(`codemod ${name} ${args.join(" ")}`)} ${cwd}`,
      );
      await spawn("npx", ["codemod@latest", name, ...args], {
        cwd,
        doNotThrowError: true,
        printOutput: true,
      });
      await next?.();
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const codemod = fnWrapper("codemod", codemodLogic);

const codemodHelpers = { codemod, exec };

type CodemodHelpers = typeof codemodHelpers;
