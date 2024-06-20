let GH_REPO_LIST = '/sourceControl/github/user/repos';
let GH_BRANCH_LIST = '/sourceControl/github/repo/branches';
let RUN_CODEMOD = '/codemodRun';
let GET_EXECUTION_STATUS = (jobId: string) => `/codemodRun/status/${jobId}`;

export { GH_REPO_LIST, GH_BRANCH_LIST, GET_EXECUTION_STATUS, RUN_CODEMOD };
