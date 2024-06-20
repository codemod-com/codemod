import type { PLazy } from './PLazy';
import { codemod } from './codemod';
import { getCwdContext } from './contexts';
import { FunctionExecutor, fnWrapper } from './engineHelpers';
import { clc } from './helpers';
import { jsFiles } from './jsFiles';
import { spawn } from './spawn';

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
	return new FunctionExecutor('exec')
		.arguments(() => ({
			command,
			args,
		}))
		.helpers(execHelpers)
		.executor(async (next, self) => {
			let { cwd } = getCwdContext();
			let { command, args } = self.getArguments();
			console.log(
				`${clc.blueBright(`${command} ${args?.join(' ') ?? ''}`)} ${cwd}`,
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

export let exec = fnWrapper('exec', execLogic);

let execHelpers = { exec, codemod, jsFiles };

type ExecHelpers = typeof execHelpers;
