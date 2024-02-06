import type { Uri } from 'vscode';
import type { RootState } from '../data';
import { CodemodHash } from '../packageJsonAnalyzer/types';
import { selectCodemodRunsTree } from './selectCodemodRunsTree';
import {
	absoluteToRelativePath,
	selectCodemodTree,
	selectPrivateCodemods,
} from './selectCodemodTree';
import { selectExplorerTree } from './selectExplorerTree';
import { selectSourceControlTabProps } from './selectSourceControlTabProps';

export const selectMainWebviewViewProps = (
	state: RootState,
	rootUri: Uri | null,
	autocompleteItems: ReadonlyArray<string> | null,
	executionQueue: ReadonlyArray<CodemodHash>,
	codemodEngineNodeLocated: boolean,
) => {
	if (rootUri === null) {
		return null;
	}

	if (state.activeTabId === 'codemods') {
		return {
			activeTabId: state.activeTabId,
			toaster: state.toaster,
			searchPhrase: state.codemodDiscoveryView.searchPhrase,
			autocompleteItems: (autocompleteItems ?? []).map((item) =>
				absoluteToRelativePath(item, rootUri.fsPath ?? ''),
			),
			codemodTree: selectCodemodTree(
				state,
				rootUri?.fsPath ?? null,
				executionQueue,
			),
			privateCodemods: selectPrivateCodemods(
				state,
				rootUri?.fsPath ?? null,
				executionQueue,
			),
			rootPath: rootUri?.fsPath ?? null,
			publicRegistryCollapsed:
				state.codemodDiscoveryView.publicRegistryCollapsed,
			privateRegistryCollapsed:
				state.codemodDiscoveryView.privateRegistryCollapsed,
			panelGroupSettings: state.codemodDiscoveryView.panelGroupSettings,
			codemodEngineNodeLocated,
		};
	}

	if (state.activeTabId === 'codemodRuns') {
		return {
			clearingInProgress: state.clearingInProgress,
			activeTabId: state.activeTabId,
			toaster: state.toaster,
			applySelectedInProgress: state.applySelectedInProgress,
			codemodRunsTree:
				rootUri !== null
					? selectCodemodRunsTree(state, rootUri.fsPath)
					: null,
			changeExplorerTree:
				rootUri !== null
					? selectExplorerTree(state, rootUri.fsPath)
					: null,
			codemodExecutionInProgress: state.caseHashInProgress !== null,
			panelGroupSettings: state.codemodRunsTab.panelGroupSettings,
			resultsCollapsed: state.codemodRunsTab.resultsCollapsed,
			changeExplorerCollapsed:
				state.codemodRunsTab.changeExplorerCollapsed,
			codemodEngineNodeLocated,
		};
	}

	if (state.activeTabId === 'sourceControl') {
		const sourceControlTabProps = selectSourceControlTabProps(state);

		return {
			activeTabId: state.activeTabId,
			toaster: state.toaster,
			title: sourceControlTabProps?.title ?? '',
			body: sourceControlTabProps?.body ?? '',
			loading: sourceControlTabProps?.loading ?? false,
			codemodEngineNodeLocated,
		};
	}

	return {
		activeTabId: state.activeTabId,
		toaster: state.toaster,
		codemodEngineNodeLocated,
	};
};

export type MainWebviewViewProps = ReturnType<
	typeof selectMainWebviewViewProps
>;
