// import { isFile } from "@babel/types";
// import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
// import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
// import { INITIAL_STATE } from "~/store/getInitialState";
// import { type TreeNode } from "../../types/tree";
// import { parseSnippet } from "../../utils/babelParser";
// import mapBabelASTToRenderableTree from "../../utils/mappers";
// import { type RangeCommand, buildRanges } from "../../utils/tree";
// import type { RootState } from "../index";
//
// const SLICE_KEY = "mod";
//
// type ModState = Readonly<{
// 	internalContent: string | null;
// 	hasRuntimeErrors: boolean;
// 	parsedContent: TreeNode | null;
// 	ranges: ReadonlyArray<OffsetRange>;
// 	rangesUpdatedAt: number;
// 	command: string | null;
// }>;
//
// const getInitialState = (): ModState => {
// 	const parsed = parseSnippet(INITIAL_STATE.codemodSource);
//
// 	const parsedContent = isFile(parsed)
// 		? mapBabelASTToRenderableTree(parsed)
// 		: null;
//
// 	return {
// 		internalContent: INITIAL_STATE.codemodSource,
// 		hasRuntimeErrors: false,
// 		parsedContent,
// 		ranges: [],
// 		rangesUpdatedAt: Date.now(),
// 		command: INITIAL_STATE.command,
// 	};
// };
//
// const modSlice = createSlice({
// 	name: SLICE_KEY,
// 	initialState: getInitialState(),
// 	reducers: {
// 		setState(state, action: PayloadAction<Partial<ModState>>) {
// 			Object.assign(state, action.payload);
// 		},
// 		setContent(state, action: PayloadAction<string>) {
// 			state.internalContent = action.payload;
//
// 			const parsed = parseSnippet(action.payload);
//
// 			state.parsedContent = isFile(parsed)
// 				? mapBabelASTToRenderableTree(parsed)
// 				: null;
// 		},
// 		setHasRuntimeErrors(state, action: PayloadAction<boolean>) {
// 			state.hasRuntimeErrors = action.payload;
// 		},
// 		setCodemodSelection(state, action: PayloadAction<RangeCommand>) {
// 			// @ts-expect-error immutability
// 			state.ranges = buildRanges(state.parsedContent, action.payload);
// 			state.rangesUpdatedAt = Date.now();
// 		},
// 		setCurrentCommand(state, action: PayloadAction<ModState["command"]>) {
// 			state.command = action.payload;
// 		},
// 	},
// 	extraReducers: {
// 		"CFS/fixCodemod/fulfilled": (
// 			state,
// 			action: PayloadAction<{ text: string }>,
// 		) => {
// 			state.internalContent = action.payload.text;
// 		},
// 	},
// });
//
// const {
// 	setState,
// 	setContent,
// 	setHasRuntimeErrors,
// 	setCodemodSelection,
// 	setCurrentCommand,
// } = modSlice.actions;
//
// const selectMod = (state: RootState) => state[SLICE_KEY];
//
// export {
// 	setState,
// 	setContent,
// 	setHasRuntimeErrors,
// 	selectMod,
// 	setCodemodSelection,
// 	setCurrentCommand,
// 	SLICE_KEY,
// };
//
// export default modSlice.reducer;
