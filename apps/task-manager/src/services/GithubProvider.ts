import { type SimpleGit, simpleGit } from "simple-git";

import axios from "axios";
import gh from "parse-github-url";

import type {
  Assignee,
  CreatePRParams,
  GithubRepository,
  Issue,
  ListPRParams,
  NewIssueParams,
  PullRequest,
  SourceControlProvider,
} from "./SourceControl.js";

type Repository = {
  owner: string;
  name: string;
};

class InvalidGithubUrlError extends Error {}
class ParseGithubUrlError extends Error {}
class GitIsNoInitializedError extends Error {}

function parseGithubRepoUrl(url: string): Repository {
  try {
    const { owner, name } = gh(url) ?? {};

    if (!owner || !name) {
      throw new InvalidGithubUrlError("Missing owner or name");
    }

    return { owner, name };
  } catch (e) {
    if (e instanceof InvalidGithubUrlError) {
      throw e;
    }

    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new ParseGithubUrlError(errorMessage);
  }
}

export class GithubProvider implements SourceControlProvider {
  private __git: SimpleGit | null = null;
  private readonly __repo: string;
  private readonly __baseUrl: string;
  private readonly __authHeader: string;
  private readonly __repoPath: string;

  constructor(oAuthToken: string, repo: string) {
    const { name } = parseGithubRepoUrl(repo);
    this.__repoPath = `./resources/repos/${name}`;
    this.__baseUrl = "https://api.github.com";
    this.__repo = repo;
    this.__authHeader = `Bearer ${oAuthToken}`;
  }

  public get ownerName() {
    const { owner } = parseGithubRepoUrl(this.__repo);
    return owner;
  }

  public get repoName() {
    const { name } = parseGithubRepoUrl(this.__repo);
    return name;
  }

  private get __repoUrl() {
    const { owner, name } = parseGithubRepoUrl(this.__repo);

    return `${this.__baseUrl}/repos/${owner}/${name}`;
  }

  async createIssue(params: NewIssueParams): Promise<Issue> {
    const res = await axios.post(`${this.__repoUrl}/issues`, params, {
      headers: {
        Authorization: this.__authHeader,
      },
    });

    return res.data;
  }

  async createPullRequest(params: CreatePRParams): Promise<PullRequest> {
    const res = await axios.post(`${this.__repoUrl}/pulls`, params, {
      headers: {
        Authorization: this.__authHeader,
        Accept: "application/vnd.github+json",
      },
    });

    return res.data;
  }

  async getPullRequests(params: ListPRParams): Promise<PullRequest[]> {
    const queryParams = Object.entries(params).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }

        return acc;
      },
      {},
    );

    const query = new URLSearchParams(queryParams).toString();

    const res = await axios.get(`${this.__repoUrl}/pulls?${query}`, {
      headers: {
        Authorization: this.__authHeader,
      },
    });

    return res.data;
  }

  async getAssignees(): Promise<Assignee[]> {
    const res = await axios.get(`${this.__repoUrl}/assignees`, {
      headers: {
        Authorization: this.__authHeader,
      },
    });

    return res.data;
  }

  async getUserRepositories(): Promise<GithubRepository[]> {
    const res = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: this.__authHeader,
      },
    });

    return res.data;
  }

  async cloneRepository(): Promise<void> {
    const { owner, name } = parseGithubRepoUrl(this.__repo);
    const repoUrl = `https://github.com/${owner}/${name}.git`;

    const git = simpleGit();

    await git.clone(repoUrl, this.__repoPath);
    this.__git = simpleGit(this.__repoPath);
  }

  async createBranch(branchName: string): Promise<void> {
    if (!this.__git) {
      throw new GitIsNoInitializedError();
    }

    await this.__git.checkoutLocalBranch(branchName);
  }

  async commitChanges(message: string): Promise<void> {
    if (!this.__git) {
      throw new GitIsNoInitializedError();
    }

    await this.__git.add("./*");
    await this.__git.commit(message);
  }

  async pushChanges(branchName: string): Promise<void> {
    if (!this.__git) {
      throw new GitIsNoInitializedError();
    }

    await this.__git.push("origin", branchName);
  }
}
