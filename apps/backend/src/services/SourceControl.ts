import { isAxiosError } from "axios";

export type NewIssueParams = Readonly<{
  body: string;
  title: string;
}>;

export type CreatePRParams = Readonly<{
  title: string;
  body: string;
  head: string;
  base: string;
}>;

export type ListPRParams = Readonly<{
  state: string | undefined;
  head: string | undefined;
  base: string | undefined;
}>;

export type GHBranch = Readonly<{ name: string }>;

export type PullRequest = Readonly<{
  html_url: string;
  head: {
    ref: string;
  };
}>;

export type Issue = Readonly<{
  html_url: string;
}>;

export type Assignee = Readonly<{
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  html_url: string;
}>;

export type GithubRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
};

export type GithubContent = {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  url: string;
  download_url: string | null;
};

export interface SourceControlProvider {
  createIssue(params: NewIssueParams): Promise<Issue>;
  createPullRequest(params: CreatePRParams): Promise<PullRequest>;
  getPullRequests(params: ListPRParams): Promise<PullRequest[]>;
  getAssignees(): Promise<Assignee[]>;
  getBranches(): Promise<any[]>;
  getUserRepositories(): Promise<GithubRepository[]>;
  getRepoContents(branchName: string): Promise<GithubContent[]>;
}

// biome-ignore lint/complexity/noStaticOnlyClass: reason?
export class SourceControlError extends Error {
  static parse(e: unknown) {
    const message =
      isAxiosError(e) && e.response?.data.message
        ? e.response?.data.message
        : e instanceof Error
          ? e.message
          : String(e);
    return new SourceControlError(message);
  }
}

export class SourceControl {
  async createIssue(
    provider: SourceControlProvider,
    params: NewIssueParams,
  ): Promise<Issue> {
    try {
      return await provider.createIssue(params);
    } catch (e) {
      throw SourceControlError.parse(e);
    }
  }

  async createPullRequest(
    provider: SourceControlProvider,
    params: CreatePRParams,
  ): Promise<PullRequest> {
    try {
      return await provider.createPullRequest(params);
    } catch (e) {
      throw SourceControlError.parse(e);
    }
  }

  async getPullRequests(
    provider: SourceControlProvider,
    params: ListPRParams,
  ): Promise<PullRequest[]> {
    try {
      return await provider.getPullRequests(params);
    } catch (e) {
      throw SourceControlError.parse(e);
    }
  }

  async getAssignees(provider: SourceControlProvider): Promise<Assignee[]> {
    try {
      return await provider.getAssignees();
    } catch (e) {
      throw SourceControlError.parse(e);
    }
  }

  async getUserRepositories(
    provider: SourceControlProvider,
  ): Promise<GithubRepository[]> {
    try {
      return await provider.getUserRepositories();
    } catch (e) {
      throw SourceControlError.parse(e);
    }
  }

  async getBranches(provider: SourceControlProvider): Promise<string[]> {
    try {
      return await provider.getBranches();
    } catch (e) {
      throw SourceControlError.parse(e);
    }
  }

  async getRepoContents(
    provider: SourceControlProvider,
    branchName: string,
  ): Promise<GithubContent[]> {
    try {
      return await provider.getRepoContents(branchName);
    } catch (e) {
      throw SourceControlError.parse(e);
    }
  }
}
