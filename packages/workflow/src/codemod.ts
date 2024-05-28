import type { PLazy } from "./PLazy";
import { getCwdContext } from "./contexts";
import { FunctionExecutor, fnWrapper } from "./engineHelpers";
import { exec } from "./exec";
import { clc } from "./helpers";
import { spawn } from "./spawn";

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

const codemodHelpers = { codemod, exec };

type CodemodHelpers = typeof codemodHelpers;
