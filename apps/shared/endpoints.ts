const GH_REPO_LIST = "/sourceControl/github/user/repos";
const GH_BRANCH_LIST = "/sourceControl/github/repo/branches";
const RUN_CODEMOD = "/codemodRun";
const GET_EXECUTION_STATUS = (jobId: string) => `/codemodRun/status/${jobId}`;

export { GH_REPO_LIST, GH_BRANCH_LIST, GET_EXECUTION_STATUS, RUN_CODEMOD };
