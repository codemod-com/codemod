import { PLazy } from "../PLazy.js";
import {
  getCwdContext,
  getParentContext,
  getRepositoryContext,
} from "../contexts.js";
import { logger, wrapHelpers } from "../helpers.js";
import { spawn } from "../spawn.js";
import { push } from "./push.js";

const helpers = { push };

type Helpers = typeof helpers;

export function commit(commitName = "no commit message provided") {
  const innerParentContext = getParentContext();

  const context = async (cb?: any) => {
    await innerParentContext(async () => {
      const { repository, branch } = getRepositoryContext();
      const { cwd } = getCwdContext();
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
    });

    if (cb) {
      await innerParentContext(() => cb());
    }

    return wrapHelpers(helpers, context);
  };

  const helpersWithContext = wrapHelpers(helpers, context);

  const promise = new PLazy<Helpers>((resolve, reject) => {
    context().then(resolve).catch(reject);
  }) as PLazy<Helpers> & Helpers;

  Object.keys(helpersWithContext).forEach((key) => {
    // @ts-ignore
    promise[key] = helpersWithContext[key];
  });

  return promise;
}
