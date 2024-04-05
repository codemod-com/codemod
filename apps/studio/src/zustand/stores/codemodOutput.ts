import { isFile } from "@babel/types";
import create from "zustand";
import type { OffsetRange } from "~/schemata/offsetRangeSchemata";
import type { TreeNode } from "~/types/tree";
import { parseSnippet } from "~/utils/babelParser";
import mapBabelASTToRenderableTree from "~/utils/mappers";
import { buildRanges } from "~/utils/tree";
import type { RangeCommand } from "~/utils/tree";

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
