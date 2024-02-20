/* eslint-disable import/group-exports */
/* eslint-disable no-param-reassign */
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { OffsetRange } from "~/schemata/offsetRangeSchemata";
import type { RootState } from "~/store";
import { isParsedResultFile, parseSnippet } from "~/utils/babelParser";
import mapBabelASTToRenderableTree from "~/utils/mappers";
import { type RangeCommand, buildRanges } from "~/utils/tree";
import type { TreeNode } from "../../types/tree";

type CodemodOutputState = Readonly<{
	content: string | null;
	rootNode: TreeNode | null;
	ranges: ReadonlyArray<TreeNode | OffsetRange>;
}>;

const initialState: CodemodOutputState = {
	content: null,
	rootNode: null,
	ranges: [],
};

export const codemodOutputSlice = createSlice({
	name: "codemodOutput",
	initialState,
	reducers: {
		setContent(state, action: PayloadAction<string>) {
			state.content = action.payload;

			const parsed = parseSnippet(action.payload);

			state.rootNode = isParsedResultFile(parsed)
				? mapBabelASTToRenderableTree(parsed)
				: null;
		},
		setSelections(state, action: PayloadAction<RangeCommand>) {
			// @ts-expect-error immutability
			state.ranges = buildRanges(state.rootNode, action.payload);
		},
	},
});

export const selectCodemodOutput = ({ codemodOutput }: RootState) =>
	codemodOutput;
