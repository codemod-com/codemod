import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';

import { noop, pickBy } from 'lodash';
import treeKill from 'tree-kill';

export let spawn = (
	cmd: string,
	args: string[],
	miscOptions: childProcess.SpawnOptionsWithoutStdio & {
		doNotThrowError?: boolean;
		printOutput?: boolean;
		printNewline?: boolean;
		watch?: string;
		doNotKill?: boolean;
		filterEnv?: (key: string, value: any) => boolean;
	} = {},
): Promise<{
	stdout: string[];
	stderr: string[];
	error: Error;
	kill: () => void;
}> => {
	let cwd = miscOptions.cwd ?? process.cwd();

	if (!fs.existsSync(cwd)) {
		return Promise.reject(
			new Error(`Provided directory: ${cwd} does not exist`),
		);
	}

	return new Promise((resolve, reject) => {
		let {
			doNotThrowError,
			printOutput,
			printNewline,
			watch,
			doNotKill,
			filterEnv,
			...execOptions
		} = miscOptions;

		let env = pickBy(
			{ ...process.env, ...execOptions?.env, FORCE_COLOR: '' },
			(value, key) => filterEnv?.(key, value) ?? true,
		);

		let proc = childProcess.spawn(cmd, args, {
			...execOptions,
			cwd,
			env,
		});

		let pid = proc.pid as number;
		let stderr = [] as string[];
		let stdout = [] as string[];

		let caughtError: Error;
		let killed = false;

		let kill = doNotKill
			? () => {
					killed = true;
					treeKill(pid, 'SIGKILL');
					proc.stdin.end();
					proc.stdout.destroy();
					proc.stderr.destroy();
				}
			: noop;

		proc.stdout.on('data', (data) => {
			let chunk = data.toString();
			stdout.push(chunk);
			if (chunk.includes('Proceed')) {
				proc.stdin.write('y\n');
			}
			if (watch && chunk.includes(watch)) {
				if (!doNotKill) {
					killed = true;
					treeKill(pid, 'SIGKILL');
					proc.stdin.end();
					proc.stdout.destroy();
					proc.stderr.destroy();
				}
				resolve({ stdout, stderr, error: caughtError, kill });
				return;
			}

			if (!killed) {
				if (printOutput) {
					process.stdout.write(chunk);
				}
				if (printNewline) {
					proc.stdin.write('\n');
				}
			}
		});

		proc.stderr.on('data', (data) => {
			let chunk = data.toString();
			stderr.push(chunk);
			if (watch && chunk.includes(watch)) {
				if (!doNotKill) {
					killed = true;
					treeKill(pid, 'SIGKILL');
					proc.stdin.end();
					proc.stdout.destroy();
					proc.stderr.destroy();
				}
				resolve({ stdout, stderr, error: caughtError, kill });
				return;
			}

			if (!killed) {
				if (printOutput) {
					process.stdout.write(chunk);
				}
				if (printNewline) {
					proc.stdin.write('\n');
				}
			}
		});

		proc.on('error', (error) => {
			// console.log(error);
			caughtError = error;
		});

		proc.on('close', (code) => {
			if (!doNotThrowError) {
				if (caughtError) {
					reject(
						new Error(
							`Failed to execute command "${cmd} ${args.join(
								' ',
							)}" with error ${caughtError.toString()}`,
						),
					);
					return;
				}

				if (code) {
					console.error(stdout.join('\n'));
					console.error(stderr.join('\n'));
					reject(
						new Error(
							`Failed to execute command "${cmd} ${args.join(
								' ',
							)}" with code ${code}`,
						),
					);
					return;
				}
			}
			resolve({ stdout, stderr, error: caughtError, kill });
		});
	});
};
