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

export let useCodemodOutputStore = create<CodemodOutputState>((set) => ({
  content: null,
  rootNode: null,
  ranges: [],
  setContent: (content) => {
    let parsed = parseSnippet(content);
    let rootNode = isFile(parsed)
      ? mapBabelASTToRenderableTree(parsed)
      : null;
    set({ content, rootNode });
  },
  setSelections: (command) => {
    set((state) => {
      let ranges = buildRanges(state.rootNode, command);
      return { ranges };
    });
  },
}));
