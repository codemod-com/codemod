import type { PLazy } from "./PLazy";
import { codemod } from "./codemod";
import { getCwdContext } from "./contexts";
import { FunctionExecutor, fnWrapper } from "./engineHelpers";
import { clc } from "./helpers";
import { spawn } from "./spawn";

export function execLogic(
  command: string,
  args?: string[],
): PLazy<ExecHelpers> & ExecHelpers {
  return new FunctionExecutor("exec")
    .arguments(() => ({
      name,
      args,
    }))
    .helpers(execHelpers)
    .executor(async (next, self) => {
      const { cwd } = getCwdContext();
      const { args } = self.getArguments();
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
