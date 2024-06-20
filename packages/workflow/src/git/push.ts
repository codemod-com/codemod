import type { PLazy } from '../PLazy.js';
import { getCwdContext, getRepositoryContext } from '../contexts.js';
import { FunctionExecutor, fnWrapper } from '../engineHelpers.js';
import { logger } from '../helpers.js';
import { spawn } from '../spawn.js';

export function pushLogic(
	{ force }: { force: boolean } = { force: false },
): PLazy<Helpers> & Helpers {
	return new FunctionExecutor('push')
		.arguments(() => ({ force }))
		.helpers(helpers)
		.executor(async (next) => {
			let { repository, branch } = getRepositoryContext();
			let { cwd } = getCwdContext();

			let log = logger(`Pushing to ${repository}/tree/${branch}`);
			try {
				await spawn('git', ['push', ...(force ? ['-f'] : [])], {
					cwd,
				});
				log.success();
			} catch (e: any) {
				log.fail(e.toString());
			}
			await next();
		})
		.return((self) => self.wrappedHelpers())
		.run();
}

export let push = fnWrapper('push', pushLogic);

let helpers = {};

type Helpers = typeof helpers;
