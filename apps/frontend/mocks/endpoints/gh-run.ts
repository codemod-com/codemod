const GH_REPO_LIST = "/sourceControl/github/user/repos";
const GH_BRANCH_LIST = "/sourceControl/github/repo/branches";
const RUN_CODEMOD = "/run/codemodRun";
const EXECUTION_STATUS = `/run/codemodRun/status/:id`;

const GET_EXECUTION_STATUS = (jobId: string) =>
  `/run/codemodRun/status/${jobId}`;

export {
  GH_REPO_LIST,
  GH_BRANCH_LIST,
  RUN_CODEMOD,
  EXECUTION_STATUS,
  GET_EXECUTION_STATUS,
};
