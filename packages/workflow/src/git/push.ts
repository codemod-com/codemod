import { PLazy } from "../PLazy.js";
import {
  getCwdContext,
  getParentContext,
  getRepositoryContext,
} from "../contexts.js";
import { logger, wrapHelpers } from "../helpers.js";
import { spawn } from "../spawn.js";

const helpers = {};

type Helpers = typeof helpers;

export function push({ force }: { force: boolean } = { force: false }) {
  const innerParentContext = getParentContext();

  const context = async (cb?: any) => {
    await innerParentContext(async () => {
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
