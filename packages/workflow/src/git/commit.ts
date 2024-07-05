import type { PLazy } from "../PLazy.js";
import { getCwdContext, getRepositoryContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { logger } from "../helpers.js";
import { spawn } from "../spawn.js";
import { push } from "./push.js";

export function commitLogic(message: string): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("commit")
    .arguments(() => ({
      message,
    }))
    .helpers(helpers)
    .executor(async (next, self) => {
      const { message } = self.getArguments();
      const { cwd } = getCwdContext();
      const { repository, branch } = getRepositoryContext();
      const log = logger(
        `Committing to ${repository}/tree/${branch}${
          message ? ` with message: ${JSON.stringify(message)}` : ""
        }`,
      );
      try {
        await spawn("git", ["add", "."], { cwd });
        const { stdout } = await spawn("git", ["commit", "-m", message], {
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
