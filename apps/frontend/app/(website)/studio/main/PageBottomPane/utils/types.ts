import type { KnownEngines } from "@codemod-com/utilities";
import type { useCodeDiff } from "@studio/hooks/useCodeDiff";
import type { VisibilityOptions } from "@studio/types/options";
import type { ValueOf } from "next/constants";
import type { MutableRefObject, ReactNode } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

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
  engine: KnownEngines;
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
  TOP = 15,
  BOTTOM = 16,
}

export type PanelData = Pick<
  PanelComponentProps,
  "visibilityOptions" | "hasBoundResize"
> & {
  hasVisibilityOptions?: boolean;
  boundIndex?: ResizablePanelsIndices;
  snippedIndex: ResizablePanelsIndices;
  type: ContentViewerVariant;
  relatedAST: ResizablePanelsIndices;
  defaultSize?: number;
  snippetData: SnippetData;
};

export type HeaderProps = {
  isCollapsed?: boolean;
  // @TODO
  ondblclick?: (typeof console)["log"];
  title: ReactNode;
  visibilityOptions?: VisibilityOptions;
};

export type SnippetType = "before" | "after" | "output";

export type SnippetData = {
  header: ReactNode;
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
