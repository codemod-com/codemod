import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest";
import parseGitUrl from "git-url-parse";
import type { PLazy } from "../PLazy.js";
import { getAuthService } from "../authService.js";
import { getGitContext, repositoryContext } from "../contexts.js";
import { FunctionExecutor, fnWrapper } from "../engineHelpers.js";
import { getDefaultBranchFromRemote } from "../git/helpers.js";
import { logger } from "../helpers.js";

export function prLogic(
  title: string,
  body?: string | readonly string[],
): PLazy<Helpers> & Helpers {
  return new FunctionExecutor("pr")
    .arguments(() => {
      return {
        title,
        body: typeof body === "string" ? body : body?.join(""),
      };
    })
    .helpers(helpers)
    .executor(async (next, self) => {
      const { body, title } = self.getArguments();
      const authService = getAuthService();
      const isAvailable = await authService?.ensureGithubScopes(["repo"]);
      if (!isAvailable) {
        console.log("Github scopes not available");
        return;
      }
      const githubAPIKey = await authService?.getGithubAPIKey();
      const gitContext = getGitContext();
      if (githubAPIKey) {
        const octokit = new Octokit({
          auth: githubAPIKey,
        });
        const url = parseGitUrl(gitContext.get("repository"));
        let owner = url.owner;
        let repo = url.name;
        let head = (await gitContext.simpleGit.branchLocal()).current;

        const repository = repositoryContext.getStore();
        if (repository?.forkedFrom) {
          const parentUrl = parseGitUrl(repository?.forkedFrom);
          owner = parentUrl.owner;
          repo = parentUrl.name;
          head = `${url.owner}:${head}`;
        }

        const parameters: RestEndpointMethodTypes["pulls"]["create"]["parameters"] =
          {
            owner,
            repo,
            title,
            head,
            base: (await getDefaultBranchFromRemote(
              gitContext.get("repository"),
            )) as string,
            body,
          };
        const log = logger(`Creating PR for ${owner}/${repo}`);

        try {
          const response = await octokit.pulls.create(parameters);
          log.success(`Created PR ${response.data.html_url}`);
        } catch (error: any) {
          if (error.toString().includes("A pull request already exists")) {
            // Update PR
            const prs = await octokit.pulls.list({
              owner,
              repo,
              head,
            });
            if (prs.data.length > 0) {
              const pr = prs
                .data[0] as RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][0];
              try {
                await octokit.pulls.update({
                  owner,
                  repo,
                  pull_number: pr.number,
                  title,
                  body,
                });
                log.success(`Updated PR ${pr.html_url}`);
              } catch (error: any) {
                log.fail(error.toString());
              }
            } else {
              log.fail(error.toString());
            }
          } else {
            log.fail(error.toString());
          }
        }
        await next();
      }
    })
    .return((self) => self.wrappedHelpers())
    .run();
}

export const pr = fnWrapper("pr", prLogic);

const helpers = {};

type Helpers = typeof helpers;
