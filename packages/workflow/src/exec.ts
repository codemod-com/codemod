import type { PLazy } from "./PLazy.js";
import { codemod } from "./codemod.js";
import { getCwdContext } from "./contexts.js";
import { FunctionExecutor, fnWrapper } from "./engineHelpers.js";
import { files } from "./files.js";
import { clc } from "./helpers.js";
import { jsFiles } from "./jsFiles.js";
import { spawn } from "./spawn.js";

/**
 * Run a command in current working directory
 * @param command The command to run
 * @param args Arguments to pass to the command
 *
 * @example
 * Simple run
 * ```ts
 * await exec("ls");
 * ```
 *
 * @example
 * Run with arguments
 * ```ts
 * await exec("ls", ["-al"]);
 * ```
 *
 * @example
 * Chaining commands
 * ```ts
 * await exec("ls")
 *   .exec("pwd")
 *   .exec("ls", ["-al"]);
 * ```
 */
export function execLogic(
  command: string,
  args?: string[],
): PLazy<ExecHelpers> & ExecHelpers {
  return new FunctionExecutor("exec")
    .arguments(() => ({
      command,
      args,
    }))
    .helpers(execHelpers)
    .executor(async (next, self) => {
      const { cwd } = getCwdContext();
      const { command, args } = self.getArguments();
      console.log(
        `${clc.blueBright(`${command} ${args?.join(" ") ?? ""}`)} ${cwd}`,
      );
      await spawn(command, args ?? [], {
        cwd,
        doNotThrowError: true,
        printOutput: true,
      });
      await next?.();
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const exec = fnWrapper("exec", execLogic);

const execHelpers = { exec, codemod };

type ExecHelpers = typeof execHelpers;
