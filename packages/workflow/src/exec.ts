import type { PLazy } from "./PLazy.js";
import { codemod } from "./codemod.js";
import { execContext, getCwdContext, getExecContext } from "./contexts.js";
import { FunctionExecutor, fnWrapper } from "./engineHelpers.js";
import { clc } from "./helpers.js";
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
  { skipLog }: { skipLog?: boolean } = {},
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
      if (!skipLog) {
        console.log(
          `${clc.blueBright(`${command} ${args?.join(" ") ?? ""}`)} ${cwd}`,
        );
      }
      const response = await spawn(command, args ?? [], {
        cwd,
        doNotThrowError: true,
      });
      await execContext.run(response, () => next?.());
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const exec = fnWrapper("exec", execLogic);

export function stderrLogic(): PLazy<string[]> & string[] {
  let stderr: string[];
  return new FunctionExecutor("stderr")
    .executor(async (next, self) => {
      stderr = getExecContext().stderr;
    })
    .return(() => stderr)
    .run();
}

export const stderr = fnWrapper("stderr", stderrLogic);

const execHelpers = {
  exec,
  codemod,
  stderr,
};

type ExecHelpers = typeof execHelpers;
