import { createBeforeAfterSnippets } from '../components/webview/CustomPanelProvider';
import type { RootState } from '../data';

let sanitizeCodeBlock = (codeBlock: string) =>
	codeBlock.replace(/</g, '&lt;').replace(/>/g, '&gt;');

let buildIssueTemplateInHTML = (
	codemodName: string,
	before: string | null,
	after: string | null,
	expected: string | null,
): string => {
	return `
<hr>
<p>
<span style="font-size: 18px; font-weight: bold; color: #FFA500;">⚠️⚠️ Please do not include any proprietary code in the issue. ⚠️⚠️</span>
</p>
<hr>
<h3>Codemod: ${codemodName}</h3>
<p><strong>1. Code before transformation (Input for codemod)</strong></p>
<pre><code>${before !== null ? sanitizeCodeBlock(before) : '// paste code here'}</code></pre>
<p><strong>2. Expected code after transformation (Desired output of codemod)</strong></p>
<pre><code>${
		expected !== null ? sanitizeCodeBlock(expected) : '// paste code here'
	}</code></pre>
<p><strong>3. Faulty code obtained after running the current version of the codemod (Actual output of codemod)</strong></p>
<pre><code>${after !== null ? sanitizeCodeBlock(after) : '// paste code here'}</code></pre>
<h3>Additional context</h3>
You can provide any relevant context here.
<hr>
`;
};

type SourceControlTabProps = Readonly<{
	title: string;
	body: string;
	loading: boolean;
}>;

export let selectSourceControlTabProps = (
	state: RootState,
): SourceControlTabProps | null => {
	let sourceControlState = state.sourceControl;

	if (sourceControlState.kind === 'IDLENESS') {
		return null;
	}

	if (sourceControlState.kind === 'ISSUE_CREATION_WAITING_FOR_AUTH') {
		return {
			title: sourceControlState.title,
			body: sourceControlState.body,
			loading: false,
		};
	}

	if (sourceControlState.kind === 'WAITING_FOR_ISSUE_CREATION_API_RESPONSE') {
		return {
			title: sourceControlState.title,
			body: sourceControlState.body,
			loading: true,
		};
	}

	let job = state.job.entities[sourceControlState.jobHash] ?? null;

	if (job === null) {
		return null;
	}

	let title = `[Codemod:${job.codemodName}] Invalid codemod output`;
	let { beforeSnippet, afterSnippet: newFileSnippet } =
		createBeforeAfterSnippets(
			sourceControlState.oldFileContent,
			sourceControlState.newFileContent,
		);

	if (sourceControlState.modifiedFileContent === null) {
		let body = buildIssueTemplateInHTML(
			job.codemodName,
			beforeSnippet,
			newFileSnippet,
			null,
		);

		return {
			title,
			body,
			loading: false,
		};
	}

	let { afterSnippet: modifiedFileSnippet } = createBeforeAfterSnippets(
		sourceControlState.oldFileContent,
		sourceControlState.modifiedFileContent,
	);

	let body = buildIssueTemplateInHTML(
		job.codemodName,
		beforeSnippet,
		newFileSnippet,
		modifiedFileSnippet,
	);

	return {
		title,
		body,
		loading: false,
	};
};
