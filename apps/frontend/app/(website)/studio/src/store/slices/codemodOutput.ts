// import { isFile } from "@babel/types";
// import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
// import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
// import type { RootState } from "@studio/store";
// import { parseSnippet } from "@studio/utils/babelParser";
// import mapBabelASTToRenderableTree from "@studio/utils/mappers";
// import { type RangeCommand, buildRanges } from "@studio/utils/tree";
// import type { TreeNode } from "../../types/tree";
//
// type CodemodOutputState = Readonly<{
// 	content: string | null;
// 	rootNode: TreeNode | null;
// 	ranges: ReadonlyArray<TreeNode | OffsetRange>;
// }>;
//
// const initialState: CodemodOutputState = {
// 	content: null,
// 	rootNode: null,
// 	ranges: [],
// };
//
// export const codemodOutputSlice = createSlice({
// 	name: "codemodOutput",
// 	initialState,
// 	reducers: {
// 		setContent(state, action: PayloadAction<string>) {
// 			state.content = action.payload;
//
// 			const parsed = parseSnippet(action.payload);
//
// 			state.rootNode = isFile(parsed)
// 				? mapBabelASTToRenderableTree(parsed)
// 				: null;
// 		},
// 		setSelections(state, action: PayloadAction<RangeCommand>) {
// 			// @ts-expect-error immutability
// 			state.ranges = buildRanges(state.rootNode, action.payload);
// 		},
// 	},
// });
//
// export const selectCodemodOutput = ({ codemodOutput }: RootState) =>
// 	codemodOutput;
