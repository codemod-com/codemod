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

export interface GithubCommit {
  sha: string;
  url: string;
}

export interface GithubRequiredStatusChecks {
  enforcement_level: string;
  contexts: string[];
}

export type GHBranch = Readonly<{
  name: string;
  commit: GithubCommit;
  protected: boolean;
  protection: {
    enabled: boolean;
    required_status_checks: GithubRequiredStatusChecks;
  };
}>;

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

export type GithubOrganization = {
  id: number;
  url: string;
  description: string;
};

export type GithubContent = {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  url: string;
  download_url: string | null;
};

export type Result =
  | {
      status: "progress" | "error";
      message: string; // internal events (crating folders, cloning repo, creating pull request etc..) | error messages
    }
  | {
      status: "executing codemod";
      progress: { processed: number; total: number };
    }
  | {
      status: "done";
      link: string; // PR Link
    };

export type GetExecutionStatusResponse = Readonly<{
  result: Result | null;
  success: boolean;
}>;

export type GetExecutionStatusRequest = Readonly<{
  token?: string | null;
  executionId?: string | null;
}>;

export type CodemodRunStatus = { codemodRunId: string; success: boolean };

export type CodemodRunRequest = {
  codemodEngine: "jscodeshift" | "ts-morph";
  repoUrl: string;
  codemodSource: string;
  codemodName: string;
  branch: string;
};
