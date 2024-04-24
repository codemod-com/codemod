import { isFile } from "@babel/types";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import type { TreeNode } from "@studio/types/tree";
import { parseSnippet } from "@studio/utils/babelParser";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";
import { buildRanges } from "@studio/utils/tree";
import type { RangeCommand } from "@studio/utils/tree";
import create from "zustand";

type CodemodOutputState = {
  content: string | null;
  rootNode: TreeNode | null;
  ranges: ReadonlyArray<TreeNode | OffsetRange>;
  setContent: (content: string) => void;
  setSelections: (command: RangeCommand) => void;
};

export const useCodemodOutputStore = create<CodemodOutputState>((set) => ({
  content: null,
  rootNode: null,
  ranges: [],
  setContent: (content) => {
    const parsed = parseSnippet(content);
    const rootNode = isFile(parsed)
      ? mapBabelASTToRenderableTree(parsed)
      : null;
    set({ content, rootNode });
  },
  setSelections: (command) => {
    set((state) => {
      const ranges = buildRanges(state.rootNode, command);
      return { ranges };
    });
  },
}));
