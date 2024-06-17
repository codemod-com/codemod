import type { PLazy } from '../PLazy.js';
import { codemod } from '../codemod.js';
import { getRepositoryContext, repositoryContext } from '../contexts.js';
import { FunctionExecutor, fnWrapper } from '../engineHelpers.js';
import { exec } from '../exec.js';
import { dirs } from '../fs/dirs.js';
import { switchBranch } from '../git.js';
import { parseMultistring } from '../helpers.js';
import { jsFiles } from '../jsFiles.js';
import { commit } from './commit.js';
import { push } from './push.js';

/**
 * Creates branch for current repository
 */
export function branchLogic(
	rawBranches: string | readonly string[],
): PLazy<BranchHelpers> & BranchHelpers;
/**
 * Creates branch for current repository
 */
export function branchLogic(
	rawBranches: string | readonly string[],
	callback: (helpers: BranchHelpers) => void | Promise<void>,
): PLazy<BranchHelpers> & BranchHelpers;
/**
 * Creates branch for current repository
 */
export function branchLogic(
	rawBranches: string | readonly string[],
	callback?: (helpers: BranchHelpers) => void | Promise<void>,
) {
	return new FunctionExecutor('branch')
		.arguments(() => ({
			branches: parseMultistring(rawBranches),
			callback,
		}))
		.helpers(branchHelpers)
		.executor(async (next, self) => {
			let { branches } = self.getArguments();
			await Promise.all(
				branches.map(async (branchName) => {
					let repo = getRepositoryContext().repository;
					await switchBranch(branchName);
					await repositoryContext.run(
						{ repository: repo, branch: branchName },
						next,
					);
				}),
			);
		})
		.callback(async (self) => {
			let { callback } = self.getArguments();
			await callback?.(branchHelpers);
		})
		.return((self) => self.wrappedHelpers())
		.run();
}

export let branch = fnWrapper('branch', branchLogic);

let branchHelpers = { jsFiles, commit, push, dirs, codemod, exec };

type BranchHelpers = typeof branchHelpers;
