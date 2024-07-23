import type { RestEndpointMethodTypes } from "@octokit/rest";
import { Octokit } from "@octokit/rest";
import { memoize } from "lodash-es";
import type { PLazy } from "../PLazy.js";
import { getAuthService } from "../authService.js";
import { repositoryContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { clone } from "../git/clone.js";
import { logger, parseMultistring } from "../helpers.js";
import { pr } from "./pr.js";
import { getForkParameters } from "./utils.js";

type ForkConfig = RestEndpointMethodTypes["repos"]["createFork"]["parameters"];

export const forkRepository = async (
  key: string,
  {
    githubAPIKey,
    parameters,
  }: {
    githubAPIKey: string;
    parameters: ForkConfig;
  },
) => {
  const octokit = new Octokit({
    auth: githubAPIKey,
  });
  const log = logger(`Forking ${parameters.owner}/${parameters.repo}`);
  try {
    const response = await octokit.repos.createFork(parameters);
    log.success(`Forked to ${response.data.full_name}`);
    const sshUrl = response.data.ssh_url;
    const branch = response.data.parent?.default_branch ?? "main";
    return {
      repository: sshUrl,
      branch,
    };
  } catch (error: any) {
    log.fail(error.toString());
  }
};

export function forkLogic(
  urlOrParameters:
    | string
    | readonly string[]
    | ForkConfig
    | (ForkConfig | string)[],
  callback?: (helpers: Helpers) => void | Promise<void>,
): PLazy<Helpers> & Helpers {
  const fork = memoize(forkRepository);
  return new FunctionExecutor("fork")
    .arguments(() => {
      let forkParameters: ForkConfig[];

      if (
        typeof urlOrParameters === "string" ||
        (Array.isArray(urlOrParameters) &&
          urlOrParameters.every((param) => typeof param === "string"))
      ) {
        forkParameters =
          parseMultistring(urlOrParameters).map(getForkParameters);
      } else if (Array.isArray(urlOrParameters)) {
        forkParameters = urlOrParameters.map((param) =>
          typeof param === "string" ? getForkParameters(param) : param,
        );
      } else {
        forkParameters = [urlOrParameters as ForkConfig];
      }

      return {
        forkParameters,
        callback,
      };
    })
    .helpers(helpers)
    .executor(async (next, self) => {
      const { forkParameters } = self.getArguments();
      const authService = getAuthService();
      const isAvailable = await authService?.ensureGithubScopes(["repo"]);
      if (!isAvailable) {
        console.log("Github scopes not available");
        return;
      }
      const githubAPIKey = await authService?.getGithubAPIKey();
      if (githubAPIKey) {
        for (const parameters of forkParameters) {
          const id = `${parameters.owner}/${parameters.repo}`;
          const clonedRepo = await fork(id, {
            githubAPIKey,
            parameters,
          });
          if (!clonedRepo) {
            return;
          }
          await repositoryContext.run(
            {
              ...clonedRepo,
              forkedFrom: `https://github.com/${parameters.owner}/${parameters.repo}`,
            },
            () => next(),
          );
        }
      }
    })
    .callback(async (self) => {
      const { callback } = self.getArguments();
      await callback?.(helpers);
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const fork = fnWrapper("fork", forkLogic);

const helpers = { clone, pr };

type Helpers = typeof helpers;
