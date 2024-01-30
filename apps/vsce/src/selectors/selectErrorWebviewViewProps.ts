import { RootState } from '../data';

export const selectErrorWebviewViewProps = (
	state: RootState,
	visible: boolean,
) => {
	if (!visible) {
		return {
			kind: 'MAIN_WEBVIEW_VIEW_NOT_VISIBLE' as const,
		};
	}

	if (state.activeTabId !== 'codemodRuns') {
		return {
			kind: 'CODEMOD_RUNS_TAB_NOT_ACTIVE' as const,
		};
	}

	const caseHash = state.codemodRunsTab.selectedCaseHash;

	if (caseHash === null) {
		return {
			kind: 'CASE_NOT_SELECTED' as const,
		};
	}

	return {
		kind: 'CASE_SELECTED' as const,
		caseHash,
		executionErrors: state.executionErrors[caseHash] ?? [],
	};
};

export type ErrorWebviewViewProps = ReturnType<
	typeof selectErrorWebviewViewProps
>;
