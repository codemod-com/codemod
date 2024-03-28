import { ValueOf } from "next/constants";
import React, { MutableRefObject, ReactNode } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useCodeDiff } from "~/pageComponents/main/JSCodeshiftRender";
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
	TAB_SECTION = 8,
	SNIPPETS_SECTION = 9,
	CODEMOD_SECTION = 10,
	TAB_CONTENT = 11,
	BEFORE_AFTER_COMBINED = 11,
	LEFT = 12,
	RIGHT = 13,
	AST_TAB = 14,
}

export type PanelContentRenderer = (engine: JSEngine) => React.ReactNode;

export type PanelData = Pick<
	PanelComponentProps,
	"visibilityOptions" | "hasBoundResize"
> & {
	hasVisibilityOptions?: boolean;
	boundIndex?: ResizablePanelsIndices;
	snippedIndex: ResizablePanelsIndices;
	type: ContentViewerVariant;
	content: PanelContentRenderer;
	relatedAST: ResizablePanelsIndices;
	defaultSize?: number;
	snippetData: SnippetData;
};

export type HeaderProps = {
	isCollapsed?: boolean;
	// @TODO
	ondblclick?: (typeof console)["log"];
	title: string;
	visibilityOptions?: VisibilityOptions;
};

export type SnippetType = "before" | "after" | "output";

export type SnippetData = {
	header: string;
	diffEditorWrapper: {
		type: SnippetType;
		warnings?: ReactNode;
	};
	snippet: "regular" | "diff";
	// @ts-ignore
	getExtras?: (x: boolean) => ReactNode;
};

export type BottomPanelName = ValueOf<{
	[x in SnippetType]: `${x}Panel`;
}>;

export type BottomPanelData = Record<BottomPanelName, PanelData>;

export type WarningTextsProps = Pick<
	ReturnType<typeof useCodeDiff>,
	| "snippetBeforeHasOnlyWhitespaces"
	| "firstCodemodExecutionErrorEvent"
	| "onDebug"
	| "codemodSourceHasOnlyWhitespaces"
>;
