import type { PLazy } from "../PLazy.js";
import { getCwdContext, getRepositoryContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { logger } from "../helpers.js";
import { spawn } from "../spawn.js";

export function pushLogic(
  { force }: { force: boolean } = { force: true },
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("push")
    .arguments(() => ({ force }))
    .helpers(helpers)
    .executor(async (next) => {
      const { repository, branch } = getRepositoryContext();
      const { cwd } = getCwdContext();

      const log = logger(`Pushing to ${repository}/tree/${branch}`);
      try {
        await spawn("git", ["push", ...(force ? ["-f"] : [])], {
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

export const push = fnWrapper("push", pushLogic);

const helpers = {};

type Helpers = typeof helpers;
