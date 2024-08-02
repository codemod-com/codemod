const GH_REPO_LIST = "/sourceControl/github/user/repos";
const GH_BRANCH_LIST = "/sourceControl/github/repo/branches";
const RUN_CODEMOD = "/run/codemodRun";

const GET_EXECUTION_STATUS = (jobId: string) =>
  `/run/codemodRun/status/${jobId}`;

const buildGetWorkflowRunUrl = (workflowRunId: string) =>
  `/workflow/runs/${workflowRunId}`;

const buildCreateWorkflowRunUrl = (workflowId: string) =>
  `workflow/${workflowId}/run`;

const buildCancelWorkflowRunUrl = (runId: string) =>
  `workflow/runs/${runId}/cancel`;

const getWorkflowRunArtifactsUrl = (runId: string) =>
  `workflow/runs/${runId}/artifacts`;

export {
  GET_EXECUTION_STATUS,
  GH_BRANCH_LIST,
  GH_REPO_LIST,
  RUN_CODEMOD,
  buildGetWorkflowRunUrl,
  buildCreateWorkflowRunUrl,
  buildCancelWorkflowRunUrl,
  getWorkflowRunArtifactsUrl,
};
