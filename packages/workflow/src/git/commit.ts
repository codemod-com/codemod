import type { PLazy } from "../PLazy.js";
import { getCwdContext, getRepositoryContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { logger } from "../helpers.js";
import { spawn } from "../spawn.js";
import { push } from "./push.js";

export function commitLogic(
  commitName = "no commit message provided",
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("commit")
    .arguments(() => ({
      commitName,
    }))
    .helpers(helpers)
    .executor(async (next, self) => {
      const { commitName } = self.getArguments();
      const { cwd } = getCwdContext();
      const { repository, branch } = getRepositoryContext();
      const log = logger(
        `Committing to ${repository}/tree/${branch}${
          commitName ? ` with message: ${JSON.stringify(commitName)}` : ""
        }`,
      );
      try {
        await spawn("git", ["add", "."], { cwd });
        const { stdout } = await spawn("git", ["commit", "-m", commitName], {
          cwd: cwd,
          doNotThrowError: true,
        });
        if (stdout.join("").match(/nothing to commit, working tree clean/gm)) {
          log.warn("Nothing to commit");
        } else {
          log.success(stdout.join(""));
        }
      } catch (e: any) {
        log.fail(e.toString());
      }
      await next();
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const commit = fnWrapper("commit", commitLogic);

const helpers = { push };

type Helpers = typeof helpers;
