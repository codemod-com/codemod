import cn from 'classnames';
import areEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import type { PanelGroupStorage } from 'react-resizable-panels';
import type { MainWebviewViewProps } from '../../../src/selectors/selectMainWebviewViewProps';
import { PanelGroup } from '../shared/Panel';
import SearchBar from '../shared/SearchBar';
import { vscode } from '../shared/utilities/vscode';
import TreeView from './TreeView';

let setSearchPhrase = (searchPhrase: string) => {
	vscode.postMessage({
		kind: 'webview.global.setCodemodSearchPhrase',
		searchPhrase,
	});
};

export let App = memo(
	(
		props: MainWebviewViewProps & {
			activeTabId: 'codemods';
			screenWidth: number | null;
		},
	) => {
		let storage = useMemo(
			(): PanelGroupStorage => ({
				getItem: () => JSON.stringify(props.panelGroupSettings),
				setItem: (_, panelGroupSettings: string): void => {
					vscode.postMessage({
						kind: 'webview.main.setCodemodDiscoveryPanelGroupSettings',
						panelGroupSettings,
					});
				},
			}),
			[props.panelGroupSettings],
		);

		return (
			<>
				<main className={cn('w-full', 'h-full', 'overflow-y-auto')}>
					<PanelGroup
						direction="vertical"
						storage={storage}
						autoSaveId="codemodListPanelGroup"
						style={{ overflow: 'auto' }}
					>
						<SearchBar
							searchPhrase={props.searchPhrase}
							setSearchPhrase={setSearchPhrase}
							placeholder="Search codemods..."
						/>
						<TreeView
							screenWidth={props.screenWidth}
							tree={props.codemodTree}
							rootPath={props.rootPath}
							autocompleteItems={props.autocompleteItems}
						/>
					</PanelGroup>
				</main>
			</>
		);
	},
	areEqual,
);
