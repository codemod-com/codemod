const GH_REPO_LIST = "/sourceControl/github/user/repos";
const GH_BRANCH_LIST = "/sourceControl/github/repo/branches";
const RUN_CODEMOD = "/run/codemodRun";
const GET_EXECUTION_STATUS = (jobId: string) =>
  `/run/codemodRun/status/${jobId}`;

export { GET_EXECUTION_STATUS, GH_BRANCH_LIST, GH_REPO_LIST, RUN_CODEMOD };
