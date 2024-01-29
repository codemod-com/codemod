import cn from 'classnames';
import areEqual from 'fast-deep-equal';
import { memo, useEffect, useMemo, useRef } from 'react';
import {
	ImperativePanelHandle,
	PanelGroupStorage,
	PanelResizeHandle,
} from 'react-resizable-panels';
import type { MainWebviewViewProps } from '../../../src/selectors/selectMainWebviewViewProps';
import { PanelGroup, ResizablePanel } from '../shared/Panel';
import SearchBar from '../shared/SearchBar';
import { SectionHeader } from '../shared/SectionHeader';
import { vscode } from '../shared/utilities/vscode';
import styles from './style.module.css';
import TreeView from './TreeView';

const setSearchPhrase = (searchPhrase: string) => {
	vscode.postMessage({
		kind: 'webview.global.setCodemodSearchPhrase',
		searchPhrase,
	});
};

export const App = memo(
	(
		props: MainWebviewViewProps & {
			activeTabId: 'codemods';
			screenWidth: number | null;
		},
	) => {
		const publicRegistryRef = useRef<ImperativePanelHandle | null>(null);
		const privateRegistryRef = useRef<ImperativePanelHandle | null>(null);

		useEffect(() => {
			if (props.publicRegistryCollapsed) {
				publicRegistryRef.current?.collapse();
			} else {
				publicRegistryRef.current?.expand();
			}

			if (props.privateRegistryCollapsed) {
				privateRegistryRef.current?.collapse();
			} else {
				privateRegistryRef.current?.expand();
			}
		}, [props.publicRegistryCollapsed, props.privateRegistryCollapsed]);

		const storage = useMemo(
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
					>
						<SectionHeader
							title={'Public Registry'}
							commands={[]}
							collapsed={props.publicRegistryCollapsed}
							onClick={(event) => {
								event.preventDefault();

								vscode.postMessage({
									kind: 'webview.global.collapsePublicRegistryPanel',
									collapsed: !props.publicRegistryCollapsed,
								});
							}}
						/>
						<ResizablePanel
							collapsible
							minSize={0}
							defaultSize={
								props.panelGroupSettings['0,0']?.[0] ?? 50
							}
							style={{
								overflowY: 'auto',
								overflowX: 'hidden',
							}}
							ref={publicRegistryRef}
							onCollapse={(collapsed) => {
								vscode.postMessage({
									kind: 'webview.global.collapsePublicRegistryPanel',
									collapsed,
								});
							}}
						>
							<SearchBar
								searchPhrase={props.searchPhrase}
								setSearchPhrase={setSearchPhrase}
								placeholder="Search public codemods..."
							/>
							<TreeView
								screenWidth={props.screenWidth}
								tree={props.codemodTree}
								rootPath={props.rootPath}
								autocompleteItems={props.autocompleteItems}
							/>
						</ResizablePanel>
						<PanelResizeHandle className="resize-handle" />
						<SectionHeader
							title="Private Registry"
							commands={[]}
							collapsed={props.privateRegistryCollapsed}
							onClick={(event) => {
								event.preventDefault();

								vscode.postMessage({
									kind: 'webview.global.collapsePrivateRegistryPanel',
									collapsed: !props.privateRegistryCollapsed,
								});
							}}
							style={{
								backgroundColor:
									'var(--vscode-tab-inactiveBackground)',
							}}
						/>
						<ResizablePanel
							collapsible
							minSize={0}
							defaultSize={
								props.panelGroupSettings['0,0']?.[1] ?? 50
							}
							style={{
								overflowY: 'auto',
								overflowX: 'hidden',
								backgroundColor:
									'var(--vscode-tab-inactiveBackground)',
							}}
							ref={privateRegistryRef}
							onCollapse={(collapsed) => {
								vscode.postMessage({
									kind: 'webview.global.collapsePrivateRegistryPanel',
									collapsed,
								});
							}}
						>
							{props.privateCodemods.nodeData.length > 0 ? (
								<TreeView
									screenWidth={props.screenWidth}
									tree={props.privateCodemods}
									rootPath={props.rootPath}
									autocompleteItems={props.autocompleteItems}
								/>
							) : (
								<div
									className={
										styles.privateCodemodWelcomeMessage
									}
								>
									<p>
										Make your own codemods in{' '}
										<a
											rel="noopener noreferrer"
											target="_blank"
											href="https://codemod.studio/"
										>
											Codemod Studio
										</a>{' '}
										with the help of AI and specialized
										debuggers.
									</p>
									<p>
										You can also kick off your codemod
										creation by creating a diff and running
										this CLI command: `intuita learn`.
									</p>
								</div>
							)}
						</ResizablePanel>
					</PanelGroup>
				</main>
			</>
		);
	},
	areEqual,
);
