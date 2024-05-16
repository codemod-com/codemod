import { type SimpleGit, simpleGit } from "simple-git";
import type { CodemodMetadata } from "../jobs/runCodemod";
import { axiosRequest, parseGithubRepoUrl } from "../util";

const BASE_URL = "https://api.github.com";

type PullRequestResponse = {
  html_url: string;
};

class GitIsNotInitializedError extends Error {}
class GithubProviderCloneRepositoryError extends Error {}
class GithubProviderCreateBranchError extends Error {}
class GithubProviderCommitChangesError extends Error {}
class GithubProviderPushChangesError extends Error {}
class GithubProviderCreatePullRequestError extends Error {}

export class GithubProviderService {
  private readonly __base: string;
  private readonly __codemodMetadata: CodemodMetadata;
  private readonly __currentBranch: string;
  private __git: SimpleGit | null;

  constructor(codemodMetadata: CodemodMetadata) {
    this.__git = null;
    this.__base = "main";
    this.__currentBranch = `codemod-${Date.now()}`;
    this.__codemodMetadata = codemodMetadata;
  }

  public async cloneRepository(path: string): Promise<void> {
    try {
      const { repoUrl, token, branch } = this.__codemodMetadata;
      const { authorName, repoName } = parseGithubRepoUrl(repoUrl);

      const url = `https://${token}@github.com/${authorName}/${repoName}.git`;

      const git = simpleGit();
      await git.clone(url, path);

      this.__git = simpleGit(path);

      if (branch) {
        await this.__git.checkout(branch);
      }
    } catch (error) {
      const { message } = error as Error;

      throw new GithubProviderCloneRepositoryError(
        `Cannot clone GitHub repository! Reason: ${message}`,
      );
    }
  }

  public async createBranch(): Promise<void> {
    try {
      if (!this.__git) {
        throw new GitIsNotInitializedError("Git client is not initialized!");
      }

      await this.__git.checkoutLocalBranch(this.__currentBranch);
    } catch (error) {
      const { message } = error as Error;

      throw new GithubProviderCreateBranchError(
        `Cannot create GitHub branch! Reason: ${message}`,
      );
    }
  }

  public async commitChanges(): Promise<void> {
    try {
      if (!this.__git) {
        throw new GitIsNotInitializedError("Git client is not initialized!");
      }

      const { repoUrl, codemodName, codemodEngine } = this.__codemodMetadata;
      const { authorName, repoName } = parseGithubRepoUrl(repoUrl);

      const message = `${codemodName}: applied changes for [${authorName}/${repoName}] repo, using ${codemodEngine} engine!`;

      await this.__git.add("./*");
      await this.__git.commit(message);
    } catch (error) {
      const { message } = error as Error;

      throw new GithubProviderCommitChangesError(
        `Cannot commit changes to branch! Reason: ${message}`,
      );
    }
  }

  public async pushChanges(): Promise<void> {
    try {
      if (!this.__git) {
        throw new GitIsNotInitializedError("Git client is not initialized!");
      }

      await this.__git.push("origin", this.__currentBranch);
    } catch (error) {
      const { message } = error as Error;

      throw new GithubProviderPushChangesError(
        `Cannot push changes to branch! Reason: ${message}`,
      );
    }
  }

  public async createPullRequest(): Promise<string> {
    try {
      const { repoUrl, codemodName, branch } = this.__codemodMetadata;
      const { authorName, repoName } = parseGithubRepoUrl(repoUrl);

      const url = `${BASE_URL}/repos/${authorName}/${repoName}/pulls`;

      const title = `[${codemodName}]: Codemod changes for ${authorName}/${repoName}.`;
      const body = `Changes applied with ${codemodName} codemod.`;

      const pullRequestResponse = await axiosRequest<PullRequestResponse>(
        url,
        "post",
        {
          head: this.__currentBranch,
          base: branch ?? this.__base,
          title,
          body,
        },
        {
          Authorization: `Bearer ${this.__codemodMetadata.token}`,
          Accept: "application/vnd.github+json",
        },
      );

      return pullRequestResponse.html_url;
    } catch (error) {
      const { message } = error as Error;

      throw new GithubProviderCreatePullRequestError(
        `Cannot create pull request! Reason: ${message}`,
      );
    }
  }
}
