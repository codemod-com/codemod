import cn from "classnames";
import areEqual from "fast-deep-equal";
import { memo, useEffect, useMemo, useRef } from "react";
import {
	ImperativePanelHandle,
	PanelGroupStorage,
} from "react-resizable-panels";
import type { MainWebviewViewProps } from "../../../src/selectors/selectMainWebviewViewProps";
import { PanelGroup, ResizablePanel } from "../shared/Panel";
import SearchBar from "../shared/SearchBar";
import { SectionHeader } from "../shared/SectionHeader";
import { vscode } from "../shared/utilities/vscode";
import TreeView from "./TreeView";

const setSearchPhrase = (searchPhrase: string) => {
	vscode.postMessage({
		kind: "webview.global.setCodemodSearchPhrase",
		searchPhrase,
	});
};

export const App = memo(
	(
		props: MainWebviewViewProps & {
			activeTabId: "codemods";
			screenWidth: number | null;
		},
	) => {
		const publicRegistryRef = useRef<ImperativePanelHandle | null>(null);

		useEffect(() => {
			if (props.publicRegistryCollapsed) {
				publicRegistryRef.current?.collapse();
			} else {
				publicRegistryRef.current?.expand();
			}
		}, [props.publicRegistryCollapsed]);

		const storage = useMemo(
			(): PanelGroupStorage => ({
				getItem: () => JSON.stringify(props.panelGroupSettings),
				setItem: (_, panelGroupSettings: string): void => {
					vscode.postMessage({
						kind: "webview.main.setCodemodDiscoveryPanelGroupSettings",
						panelGroupSettings,
					});
				},
			}),
			[props.panelGroupSettings],
		);

		return (
			<>
				<main className={cn("w-full", "h-full", "overflow-y-auto")}>
					<PanelGroup
						direction="vertical"
						storage={storage}
						autoSaveId="codemodListPanelGroup"
					>
						<SectionHeader
							title={"Public Registry"}
							commands={[]}
							collapsed={props.publicRegistryCollapsed}
							onClick={(event) => {
								event.preventDefault();

								vscode.postMessage({
									kind: "webview.global.collapsePublicRegistryPanel",
									collapsed: !props.publicRegistryCollapsed,
								});
							}}
						/>
						<ResizablePanel
							collapsible
							minSize={0}
							defaultSize={props.panelGroupSettings["0,0"]?.[0] ?? 50}
							style={{
								overflowY: "auto",
								overflowX: "hidden",
							}}
							ref={publicRegistryRef}
							onCollapse={(collapsed) => {
								vscode.postMessage({
									kind: "webview.global.collapsePublicRegistryPanel",
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
					</PanelGroup>
				</main>
			</>
		);
	},
	areEqual,
);
