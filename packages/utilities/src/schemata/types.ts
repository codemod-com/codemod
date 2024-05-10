import type * as INodeFs from "node:fs";
import type { IFs } from "memfs";

export type FileSystem = IFs | typeof INodeFs;

export interface GithubCommit {
  sha: string;
  url: string;
}

export interface GithubRequiredStatusChecks {
  enforcement_level: string;
  contexts: string[];
}

export interface GithubBranch {
  name: string;
  commit: GithubCommit;
  protected: boolean;
  protection: {
    enabled: boolean;
    required_status_checks: GithubRequiredStatusChecks;
  };
}
