import type {
  GHBranch,
  GithubRepository,
} from "../../backend/src/services/SourceControl";
import {
  GET_EXECUTION_STATUS,
  GH_BRANCH_LIST,
  GH_REPO_LIST,
  RUN_CODEMOD,
} from "../endpoints";
import type {
  CodemodRunStatus,
  GetExecutionStatusResponse,
  Result,
} from "../types";

let isSuccess = true;
const errorExecutionResult: Result = {
  status: "error",
  message: "error msg",
};
let executionResultsIndex = 0;
const getExecutionResults = (): Result[] => [
  {
    status: "progress",
    message: "progress msg 1",
  },
  {
    status: "progress",
    message: "progress msg 2",
  },
  {
    status: "executing codemod",
    progress: { processed: 0, total: 100 },
  },
  {
    status: "executing codemod",
    progress: { processed: 30, total: 100 },
  },
  {
    status: "executing codemod",
    progress: { processed: 80, total: 100 },
  },
  isSuccess
    ? {
        status: "done",
        link: "https://www.google.com", // PR Link
      }
    : errorExecutionResult,
];

export const mockGithubRepositories: GithubRepository[] = [
  {
    id: 1,
    name: "successRepo",
    full_name: "mockUser/success",
    private: false,
    html_url: "success",
    default_branch: "main",
    permissions: {
      admin: false,
      push: true,
      pull: true,
    },
  },
  {
    id: 2,
    name: "failRepo",
    full_name: "mockUser/fail",
    private: true,
    html_url: "fail",
    default_branch: "master",
    permissions: {
      admin: true,
      push: true,
      pull: false,
    },
  },
];
export const mockGHBranches: GHBranch[] = [
  {
    name: "branch1",
    commit: { sha: "sha1", url: "url1" },
    protected: true,
    protection: {
      enabled: true,
      required_status_checks: {
        enforcement_level: "level1",
        contexts: ["context1", "context2"],
      },
    },
  },
  {
    name: "branch2",
    commit: { sha: "sha2", url: "url2" },
    protected: false,
    protection: {
      enabled: false,
      required_status_checks: {
        enforcement_level: "level2",
        contexts: ["context3", "context4"],
      },
    },
  },
];
export const mockedGhRunEndpoints = {
  [GH_REPO_LIST]: {
    GET: (): GithubRepository[] => mockGithubRepositories,
  },
  [GH_BRANCH_LIST]: {
    POST: ({ repoUrl }: { repoUrl: string }): GHBranch[] => {
      isSuccess = repoUrl === "success";
      return mockGHBranches;
    },
  },
  [RUN_CODEMOD]: {
    POST: (): CodemodRunStatus => ({ codemodRunId: "1", success: true }),
  },
  [GET_EXECUTION_STATUS("1")]: {
    GET: (): GetExecutionStatusResponse => {
      const index = executionResultsIndex;
      executionResultsIndex =
        executionResultsIndex === getExecutionResults().length
          ? 0
          : executionResultsIndex + 1;
      return {
        result: getExecutionResults()[index] || null,
        success: true,
      };
    },
  },
};
