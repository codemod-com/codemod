import {
  buildCreateWorkflowRunUrl,
  buildGetWorkflowRunUrl,
  getWorkflowRunArtifactsUrl,
} from "../endpoints/gh-run";

import type { CodemodRunStatus, Result } from "@codemod-com/api-types";

const isSuccess = true;
const errorExecutionResult: Result = {
  status: "error",
  message: "error msg",
};
let workflowRunResultsIndex = 0;

const getWorkflowRun = () => [
  {
    state: "queued",
    message: "Executing workflow step: Clone repo",
    progress: 0,
  },
  {
    state: "in_progress",
    message: "Executing workflow step: Running analyzer",
    progress: 0,
  },
  {
    state: "in_progress",
    progress: 20,
    message: "Executing workflow step: Running analyzer",
  },
  {
    state: "in_progress",
    progress: 40,
    message: "Executing workflow step: Running analyzer",
  },
  {
    state: "in_progress",
    progress: 90,
    message: "Executing workflow step: Running analyzer",
  },
  {
    state: "in_progress",
    progress: 95,
    message: "Executing workflow step: Running analyzer",
  },
  {
    state: "in_progress",
    progress: 99,
    message: "Executing workflow step: Generating report",
  },
  {
    state: "done",
    artifactsUrl: "https://codemod.com/workflow/runs/1/artifacts",
  },
];

export const mockedWorkflowRunEndpoints = {
  [buildCreateWorkflowRunUrl("1")]: {
    post: (): { data: CodemodRunStatus } => ({
      data: { workflowRunId: "1", success: true },
    }),
  },
  [buildGetWorkflowRunUrl("1")]: {
    get: () => {
      const index = workflowRunResultsIndex;
      workflowRunResultsIndex =
        workflowRunResultsIndex === getWorkflowRun().length
          ? 0
          : workflowRunResultsIndex + 1;
      return {
        data: getWorkflowRun()[index] || null,
      };
    },
  },
  [getWorkflowRunArtifactsUrl("1")]: {
    get: () => {
      return {
        data: [
          {
            repo: {
              name: "reponame",
            },
            migrations: [
              {
                id: "1",
                name: "Nextjs Pages to App migration",
                category: "Codemod",
                updatedOn: "27 Jul, 2:30 PM",
                owner: "Alex",
                type: "recommended",
              },
              {
                id: "2",
                name: "Platform Eng Team - Code Health",
                category: "Codemod",
                updatedOn: "27 Jul, 2:30 PM",
                owner: "Alex",
                type: "recommended",
              },
              {
                id: "3",
                name: "React Components to Vue.js Transition Overview",
                category: "Codemod",
                updatedOn: "27 Jul, 2:30 PM",
                owner: "Alex",
                type: "recommended",
              },
              {
                id: "4",
                name: "Nextjs Pages to App migration",
                category: "Codemod",
                updatedOn: "27 Jul, 2:30 PM",
                owner: "Alex",
                type: "recommended",
              },
              {
                id: "5",
                name: "Nextjs Pages to App migration",
                category: "Codemod",
                updatedOn: "27 Jul, 2:30 PM",
                owner: "Alex",
                type: "featured",
              },
              {
                id: "6",
                name: "Nextjs Pages to App migration",
                category: "Codemod",
                updatedOn: "27 Jul, 2:30 PM",
                owner: "Alex",
                type: "featured",
              },
            ],
          },
        ],
      };
    },
  },
};
