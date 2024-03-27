import { ValueOf } from "next/constants";
import React, { MutableRefObject, ReactNode } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { DiffEditorWrapper } from "~/pageComponents/main/JSCodeshiftRender";
import SnippetUI from "~/pageComponents/main/SnippetUI";
import { JSEngine } from "~/types/Engine";
import { VisibilityOptions } from "~/types/options";

export type PanelsRefs = MutableRefObject<
	Record<string, ImperativePanelHandle | null>
>;
export type PanelComponentProps = {
	hasBoundResize?: boolean;
	defaultSize?: number;
	minSize?: number;
	panelRefIndex: ResizablePanelsIndices;
	boundedIndex?: ResizablePanelsIndices;
	direction?: "horizontal" | "vertical";
	children: React.ReactNode;
	visibilityOptions?: VisibilityOptions;
	panelRefs: PanelsRefs;
	className?: string;
	style?: Record<string, string | number>;
};

export type ToggleButtonProps = {
	onClick: () => void;
};

export type ContentViewerVariant = "before" | "after" | "output";

export type ContentViewerProps = {
	type: ContentViewerVariant;
	engine: JSEngine;
};

export enum ResizablePanelsIndices {
	BEFORE_AST = 0,
	BEFORE_SNIPPET = 1,
	BEFORE_SECTION = 2,
	AFTER_AST = 3,
	AFTER_SNIPPET = 4,
	AFTER_SECTION = 5,
	OUTPUT_AST = 6,
	OUTPUT_SNIPPET = 7,
	AST_SECTION = 8,
	SNIPPETS_SECTION = 9,
	CODE_SECTION = 10,
	TAB_CONTENT = 11,
}

export type PanelContentRenderer = (engine: JSEngine) => React.ReactNode;

export type PanelData = Pick<
	PanelComponentProps,
	"visibilityOptions" | "hasBoundResize"
> & {
	boundIndex?: ResizablePanelsIndices;
	snippedIndex: ResizablePanelsIndices;
	type: ContentViewerVariant;
	content: PanelContentRenderer;
	relatedAST: ResizablePanelsIndices;
	defaultSize?: number;
};

export type HeaderProps = {
	isCollapsed?: boolean;
	// @TODO
	ondblclick?: (typeof console)["log"];
	title: string;
	visibilityOptions?: VisibilityOptions;
};

export type PanelRefs = React.MutableRefObject<
	Record<string, ImperativePanelHandle | null>
>;

export type SnippetType = "before" | "after" | "output";

export type SnippetData = {
	header: string;
	panelData: PanelData;
	diffEditorWrapper: {
		type: SnippetType;
		warnings?: ReactNode;
	};
	Snipped: typeof SnippetUI | typeof DiffEditorWrapper;
	extras?: ReactNode;
};

export type BottomPanelName = ValueOf<{
	[x in SnippetType]: `${x}Panel`;
}>;

export type BottomPanelData = Record<BottomPanelName, PanelData>;
