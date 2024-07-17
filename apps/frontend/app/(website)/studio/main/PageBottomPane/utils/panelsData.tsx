import {
  type PanelData,
  ResizablePanelsIndices,
} from "@studio/main/PageBottomPane/utils/types";
import type { Repeat } from "@studio/types/transformations";
import * as React from "react";

const beforePanel: PanelData = {
  relatedAST: ResizablePanelsIndices.BEFORE_AST,
  boundIndex: ResizablePanelsIndices.BEFORE_AST,
  snippedIndex: ResizablePanelsIndices.BEFORE_SNIPPET,
  type: "before",
  hasBoundResize: true,
  snippetData: {
    header: (
      <span className="flex items-center justify-center justify-content-center">
        Before
      </span>
    ),
    diffEditorWrapper: {
      type: "before",
    },
    snippet: "regular",
  },
};

const afterPanel: PanelData = {
  relatedAST: ResizablePanelsIndices.AFTER_AST,
  snippedIndex: ResizablePanelsIndices.AFTER_SNIPPET,
  type: "after",
  hasBoundResize: false,
  snippetData: {
    header: "After (Expected)",
    diffEditorWrapper: {
      type: "after",
    },
    snippet: "diff",
  },
};

const outputPanel: PanelData = {
  relatedAST: ResizablePanelsIndices.OUTPUT_AST,
  snippedIndex: ResizablePanelsIndices.OUTPUT_SNIPPET,
  type: "output",
  snippetData: {
    header: (
      <span className="flex items-center justify-center justify-content-center">
        Output
      </span>
    ),
    snippet: "diff",
    diffEditorWrapper: {
      type: "output",
    },
  },
};

const panels: Repeat<PanelData, 3> = [beforePanel, afterPanel, outputPanel];

export const panelsData = {
  panels,
  beforePanel,
  afterPanel,
  outputPanel,
};
