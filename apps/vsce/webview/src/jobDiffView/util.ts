import type { JobHash } from '../shared/types';
import { vscode } from '../shared/utilities/vscode';

export let reportIssue = (
	faultyJobHash: JobHash,
	oldFileContent: string,
	newFileContent: string,
	modifiedFileContent: string | null,
) => {
	vscode.postMessage({
		kind: 'webview.global.openIssueCreation',
		faultyJobHash,
		oldFileContent,
		newFileContent,
		modifiedFileContent,
	});
};

export let exportToCodemodStudio = (
	faultyJobHash: JobHash,
	oldFileContent: string,
	newFileContent: string,
) => {
	vscode.postMessage({
		kind: 'webview.global.exportToCodemodStudio',
		faultyJobHash,
		oldFileContent,
		newFileContent,
	});
};
