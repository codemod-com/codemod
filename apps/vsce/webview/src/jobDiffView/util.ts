import type { JobHash } from "../shared/types";
import { vscode } from "../shared/utilities/vscode";

export const reportIssue = (
	faultyJobHash: JobHash,
	oldFileContent: string,
	newFileContent: string,
	modifiedFileContent: string | null,
) => {
	vscode.postMessage({
		kind: "webview.global.openIssueCreation",
		faultyJobHash,
		oldFileContent,
		newFileContent,
		modifiedFileContent,
	});
};

export const exportToCodemodStudio = (
	faultyJobHash: JobHash,
	oldFileContent: string,
	newFileContent: string,
) => {
	vscode.postMessage({
		kind: "webview.global.exportToCodemodStudio",
		faultyJobHash,
		oldFileContent,
		newFileContent,
	});
};
