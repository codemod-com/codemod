import React, { PropsWithChildren, useEffect } from "react";
import { PanelGroup } from "react-resizable-panels";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import { isServer } from "~/config";
import { VisibilityIcon } from "~/icons/VisibilityIcon";
import { cn } from "~/lib/utils";
import ASTViewer from "~/pageComponents/main/ASTViewer";
import { JSEngine } from "~/types/Engine";
import { debounce } from "~/utils/debounce";
import { isNil } from "~/utils/isNil";
import { isVisible } from "~/utils/visibility";
import Layout from "../../Layout";
import {
	ContentViewerProps,
	PanelComponentProps,
	PanelData,
	PanelRefs,
	SnippetType,
} from "../utils/types";

export const BoundResizePanel = ({
	defaultSize = 33,
	minSize = 0,
	panelRefs,
	panelRefIndex,
	children,
	boundedIndex,
	className,
	style = { maxHeight: isServer ? 0 : "unset" },
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
			style={style}
			onResize={
				!isNil(boundedIndex)
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
	sectionsToShow,
	panels,
	panelRefs,
	engine,
}: {
	sectionsToShow: SnippetType[];
	panels: PanelData[];
	panelRefs: PanelRefs;
	engine: JSEngine;
}) => {
	useEffect(() => {
		// console.log('ResizablePanelsIndices.CODE_SECTION', panelRefs.current[ResizablePanelsIndices.CODE_SECTION]),
		// panelRefs.current[ResizablePanelsIndices.CODE_SECTION]?.collapse()
	}, []);
	return panels
		.filter(({ type }) => sectionsToShow.includes(type))
		.filter(isVisible)
		.map((panel, i, { length }) => (
			<>
				<BoundResizePanel
					className="h-full"
					panelRefs={panelRefs}
					key={panel.relatedAST}
					defaultSize={100 / panels.length}
					panelRefIndex={panel.relatedAST}
					boundedIndex={panel.boundIndex}
					{...panel}
				>
					<ContentViewer type={panel.type} engine={engine} />
				</BoundResizePanel>
				{i !== length - 1 && <ResizeHandle direction="horizontal" />}
			</>
		));
};

export const ShowPanelTile = ({
	panel,
	header,
}: { panel: PanelData; header: string }) => (
	<div className="hidden_panel_indicator">
		<VisibilityIcon visibilityOptions={panel.visibilityOptions} />
		<span className="hidden_panel_indicator_text">{header}</span>
	</div>
);
