import type { Uri } from 'vscode';
import type { RootState } from '../data';
import type { CodemodHash } from '../packageJsonAnalyzer/types';
import { selectCodemodRunsTree } from './selectCodemodRunsTree';
import { selectCodemodTree, selectPrivateCodemods } from './selectCodemodTree';
import { selectExplorerTree } from './selectExplorerTree';
import { selectSourceControlTabProps } from './selectSourceControlTabProps';

export const selectMainWebviewViewProps = (
	state: RootState,
	rootUri: Uri | null,
	autocompleteItems: ReadonlyArray<string>,
	executionQueue: ReadonlyArray<CodemodHash>,
) => {
	if (rootUri === null) {
		return null;
	}

	if (state.activeTabId === 'codemods') {
		return {
			activeTabId: state.activeTabId,
			toaster: state.toaster,
			searchPhrase: state.codemodDiscoveryView.searchPhrase,
			autocompleteItems,
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
		};
	}

	return {
		activeTabId: state.activeTabId,
		toaster: state.toaster,
	};
};

export type MainWebviewViewProps = ReturnType<
	typeof selectMainWebviewViewProps
>;
