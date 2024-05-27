
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

export type CodemodRunStatus = { codemodRunId: string, success: boolean }

export type CodemodRunRequest = {
	codemodEngine: "jscodeshift" | "ts-morph";
	repoUrl: string;
	codemodSource: string;
	codemodName: string;
	branch: string
}