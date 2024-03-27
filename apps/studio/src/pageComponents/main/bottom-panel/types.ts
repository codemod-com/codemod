import React, { MutableRefObject } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { JSEngine } from "~/types/Engine";
import { VisibilityOptions } from "~/types/options";

export type PanelsRefs = MutableRefObject<
	Record<string, ImperativePanelHandle | null>
>;
export type PanelComponentProps = {
	hasBoundResize?: boolean;
	defaultSize?: number;
	minSize?: number;
	panelRefIndex: Panel;
	boundedIndex?: Panel;
	direction?: "horizontal" | "vertical";
	children: React.ReactNode;
	visibilityOptions?: VisibilityOptions;
	panelRefs: PanelsRefs;
};

export type ToggleButtonProps = {
	onClick: () => void;
};

export type ContentViewerVariant = "before" | "after" | "output";

export type ContentViewerProps = {
	type: ContentViewerVariant;
	engine: JSEngine;
};

export enum Panel {
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
}

export type PanelContentRenderer = (engine: JSEngine) => React.ReactNode;

export type PanelData = Pick<
	PanelComponentProps,
	"visibilityOptions" | "hasBoundResize"
> & {
	astIndex: Panel;
	snippedIndex: Panel;
	type: ContentViewerVariant;
	content: PanelContentRenderer;
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
