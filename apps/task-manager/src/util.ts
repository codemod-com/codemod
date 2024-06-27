import gh from "parse-github-url";

import { parseEnvironment } from "./schemata/env.js";

export const environment = parseEnvironment(process.env);

class InvalidGithubUrlError extends Error {}
class ParseGithubUrlError extends Error {}

type Repository = {
  authorName: string;
  repoName: string;
};

export function parseGithubRepoUrl(url: string): Repository {
  try {
    const { owner, name } = gh(url) ?? {};
    if (!owner || !name)
      throw new InvalidGithubUrlError("Missing owner or name");

    return { authorName: owner, repoName: name };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ParseGithubUrlError(errorMessage);
  }
}
