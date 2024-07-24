import type { RestEndpointMethodTypes } from "@octokit/rest";
import parseGitUrl from "git-url-parse";

export const getForkParameters = (
  repoUrl: string,
): RestEndpointMethodTypes["repos"]["createFork"]["parameters"] => {
  const url = parseGitUrl(repoUrl);

  return {
    owner: url.owner,
    repo: url.name,
    name: url.name,
  };
};
