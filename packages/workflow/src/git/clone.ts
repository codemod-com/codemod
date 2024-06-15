import type { PLazy } from '../PLazy.js';
import { codemod } from '../codemod.js';
import { cwdContext, repositoryContext } from '../contexts.js';
import { FunctionExecutor, fnWrapper } from '../engineHelpers.js';
import { exec } from '../exec.js';
import { dirs } from '../fs/dirs.js';
import { cloneRepository } from '../git.js';
import { parseMultistring } from '../helpers.js';
import { jsFiles } from '../jsFiles.js';
import { branch } from './branch.js';
import { commit } from './commit.js';
import { push } from './push.js';

/**
 *
 * @param rawRepositories
 */
export function cloneLogic(
	rawRepositories: string | readonly string[],
): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param rawRepositories
 * @param callback
 */
export function cloneLogic(
	rawRepositories: string | readonly string[],
	callback: (helpers: CloneHelpers) => void | Promise<void>,
): PLazy<CloneHelpers> & CloneHelpers;
/**
 *
 * @param rawRepositories
 * @param callback
 * @returns
 */
export function cloneLogic(
	rawRepositories: string | readonly string[],
	callback?: (helpers: CloneHelpers) => void | Promise<void>,
) {
	return new FunctionExecutor('clone')
		.arguments(() => ({
			repositories: parseMultistring(rawRepositories),
			callback,
		}))
		.helpers(cloneHelpers)
		.executor(async (next, self) => {
			let { repositories } = self.getArguments();
			await Promise.all(
				repositories.map((repository, index) =>
					cwdContext.run({ cwd: process.cwd() }, async () => {
						let branch = await cloneRepository(
							repository,
							String(index),
						);
						await repositoryContext.run(
							{ repository, branch },
							next,
						);
					}),
				),
			);
		})
		.callback(async (self) => {
			let { callback } = self.getArguments();
			await callback?.(cloneHelpers);
		})
		.return((self) => self.wrappedHelpers())
		.run();
}

export let clone = fnWrapper('clone', cloneLogic);

let cloneHelpers = { jsFiles, branch, commit, push, dirs, codemod, exec };

type CloneHelpers = typeof cloneHelpers;
