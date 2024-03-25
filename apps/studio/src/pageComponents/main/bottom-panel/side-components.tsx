import React, { PropsWithChildren } from "react";
import { PanelGroup } from "react-resizable-panels";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import { Button } from "~/components/ui/button";
import { isServer } from "~/config";
import { cn } from "~/lib/utils";
import ASTViewer from "~/pageComponents/main/ASTViewer";
import SnippetUI from "~/pageComponents/main/SnippetUI";
import { SnippetHeader } from "~/pageComponents/main/bottom-panel/SnippedHeader";
import { JSEngine } from "~/types/Engine";
import { debounce } from "~/utils/debounce";
import { isNil } from "~/utils/isNil";
import Layout from "../Layout";
import {
	ContentViewerProps,
	PanelComponentProps,
	PanelData,
	PanelRefs,
	ToggleButtonProps,
} from "./types";

export const BoundResizePanel = ({
	defaultSize = 33,
	minSize = 0,
	panelRefs,
	panelRefIndex,
	children,
	boundedIndex,
	hasBoundResize = false,
	className,
}: PanelComponentProps) => {
	return (
		<Layout.ResizablePanel
			className={cn("relative dark:bg-gray-light", className)}
			collapsible
			defaultSize={defaultSize}
			minSize={minSize}
			ref={(ref) => {
				panelRefs.current[panelRefIndex] = ref;
			}}
			style={{ maxHeight: isServer ? 0 : "unset" }}
			onResize={
				hasBoundResize && !isNil(boundedIndex)
					? debounce((size) => {
							const panel = panelRefs.current[boundedIndex];
							if (!isNil(panel) && !isNil(size)) panel.resize(size);
					  }, 5)
					: undefined
			}
		>
			{children}
		</Layout.ResizablePanel>
	);
};

export const ToggleASTButton: React.FC<ToggleButtonProps> = ({ onClick }) => (
	<Button
		className="flex cursor-pointer items-center justify-center rounded-none px-2 py-1"
		onClick={onClick}
		variant="ghost"
	>
		AST
	</Button>
);

export const ContentViewer: React.FC<ContentViewerProps> = ({
	type,
	engine,
}) => (
	<>
		{engine === "jscodeshift" ? (
			<ASTViewer type={type} />
		) : (
			"The AST View is not yet supported for tsmorph"
		)}
	</>
);

export const BottomPanel: React.FC<PropsWithChildren> = ({ children }) => (
	<Layout.ResizablePanel
		collapsible
		defaultSize={50}
		minSize={0}
		style={{
			flexBasis: isServer ? "50%" : "0",
		}}
	>
		<PanelGroup direction="vertical">{children}</PanelGroup>
	</Layout.ResizablePanel>
);

export const AstSection = ({
	panels,
	panelRefs,
	engine,
}: {
	panels: PanelData[];
	panelRefs: PanelRefs;
	engine: JSEngine;
}) =>
	panels.map((panel, i, { length }) => (
		<>
			<BoundResizePanel
				panelRefs={panelRefs}
				key={panel.astIndex}
				defaultSize={33}
				panelRefIndex={panel.astIndex}
				boundedIndex={panel.snippedIndex}
				{...panel}
			>
				<ContentViewer type={panel.type} engine={engine} />
			</BoundResizePanel>
			{i !== length - 1 && <ResizeHandle direction="horizontal" />}
		</>
	));

export const BeforeCodeSnippedPanel = ({
	beforePanel,
	panelRefs,
}: {
	beforePanel: PanelData;
	panelRefs: PanelRefs;
}) => (
	<BoundResizePanel
		panelRefs={panelRefs}
		panelRefIndex={beforePanel.snippedIndex}
		boundedIndex={beforePanel.astIndex}
		defaultSize={33}
		{...beforePanel}
	>
		<SnippetHeader title="Before" />
		<SnippetUI type="before" />
	</BoundResizePanel>
);
