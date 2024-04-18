// import { isFile } from "@babel/types";
// import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
// import type { Token } from "~/pageComponents/main/CFS/SelectionShowCase";
// import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
// import { INITIAL_STATE } from "~/store/getInitialState";
// import { JSEngine } from "~/types/Engine";
// import { type TreeNode } from "~/types/tree";
// import mapBabelASTToRenderableTree from "~/utils/mappers";
// import { type RangeCommand, buildRanges } from "~/utils/tree";
// import { parseSnippet } from "../../utils/babelParser";
// import type { RootState } from "../index";
// import { selectCodemodOutput } from "./codemodOutput";
//
// const SLICE_KEY = "snippets";
//
// type SnippetState = Readonly<{
// 	engine: JSEngine;
//
// 	// beforeInput
// 	inputSnippet: string;
// 	beforeInputRanges: ReadonlyArray<TreeNode | OffsetRange>;
// 	beforeRangeUpdatedAt: number;
// 	beforeInputRootNode: TreeNode | null;
// 	beforeInputTokens: ReadonlyArray<Token>;
//
// 	// afterInput
// 	outputSnippet: string;
// 	afterInputRanges: ReadonlyArray<TreeNode | OffsetRange>;
// 	afterRangeUpdatedAt: number;
// 	afterInputRootNode: TreeNode | null;
// 	afterInputTokens: ReadonlyArray<Token>;
// }>;
//
// type Engine = SnippetState["engine"];
//
// const getInitialState = (): SnippetState => {
// 	const { engine, beforeSnippet, afterSnippet } = INITIAL_STATE;
//
// 	// before input
// 	const beforeInputParsed = parseSnippet(beforeSnippet);
//
// 	const beforeInputRootNode = isFile(beforeInputParsed)
// 		? mapBabelASTToRenderableTree(beforeInputParsed)
// 		: null;
//
// 	const beforeInputTokens = isFile(beforeInputParsed)
// 		? Array.isArray(beforeInputParsed.tokens)
// 			? (beforeInputParsed.tokens as any[]).map(({ start, end, value }) => ({
// 					start,
// 					end,
// 					value: value ?? beforeSnippet.slice(start, end),
// 			  }))
// 			: []
// 		: [];
//
// 	// after input
// 	const afterInputParsed = parseSnippet(afterSnippet);
//
// 	const afterInputRootNode = isFile(afterInputParsed)
// 		? mapBabelASTToRenderableTree(afterInputParsed)
// 		: null;
//
// 	const afterInputTokens = isFile(afterInputParsed)
// 		? Array.isArray(afterInputParsed.tokens)
// 			? (afterInputParsed.tokens as any[]).map(({ start, end, value }) => ({
// 					start,
// 					end,
// 					value: value ?? afterSnippet.slice(start, end),
// 			  }))
// 			: []
// 		: [];
//
// 	return {
// 		engine,
// 		beforeInputRootNode,
// 		afterInputRootNode,
// 		outputSnippet: afterSnippet,
// 		inputSnippet: beforeSnippet,
// 		beforeInputRanges: [],
// 		beforeRangeUpdatedAt: Date.now(),
// 		afterInputRanges: [],
// 		afterRangeUpdatedAt: Date.now(),
// 		beforeInputTokens,
// 		afterInputTokens,
// 	};
// };
//
// const snippetsSlice = createSlice({
// 	name: "snippets",
// 	initialState: getInitialState(),
// 	reducers: {
// 		setEngine(state, action: PayloadAction<SnippetState["engine"]>) {
// 			state.engine = action.payload;
// 		},
// 		setInput(state, action: PayloadAction<string>) {
// 			const beforeInputParsed = parseSnippet(action.payload);
//
// 			state.inputSnippet = action.payload;
// 			// state.beforeInputRanges = [];
// 			state.beforeInputRootNode = isFile(beforeInputParsed)
// 				? mapBabelASTToRenderableTree(beforeInputParsed)
// 				: null;
// 		},
// 		setOutput(state, action: PayloadAction<string>) {
// 			const afterInputParsed = parseSnippet(action.payload);
//
// 			state.outputSnippet = action.payload;
// 			// state.afterInputRanges = [];
// 			state.afterInputRootNode = isFile(afterInputParsed)
// 				? mapBabelASTToRenderableTree(afterInputParsed)
// 				: null;
// 		},
// 		setInputSelection(state, action: PayloadAction<RangeCommand>) {
// 			// @ts-expect-error immutability
// 			state.beforeInputRanges = buildRanges(
// 				state.beforeInputRootNode,
// 				action.payload,
// 			);
// 			state.beforeRangeUpdatedAt = Date.now();
// 		},
// 		setOutputSelection(state, action: PayloadAction<RangeCommand>) {
// 			// @ts-expect-error immutability
// 			state.afterInputRanges = buildRanges(
// 				state.afterInputRootNode,
// 				action.payload,
// 			);
// 			state.afterRangeUpdatedAt = Date.now();
// 		},
// 	},
// });
//
// const {
// 	setEngine,
// 	setInput,
// 	setOutput,
// 	setInputSelection,
// 	setOutputSelection,
// } = snippetsSlice.actions;
//
// const selectSnippets = (state: RootState) => state[SLICE_KEY];
//
// const selectEngine = (state: RootState) => selectSnippets(state).engine;
//
// const selectSnippetsFor =
// 	(type: "before" | "after" | "output") => (state: RootState) => {
// 		// @TODO make reusable reducer for the code snippet
// 		// that will include snippet, rootNode, ranges,
//
// 		const {
// 			inputSnippet,
// 			outputSnippet,
// 			beforeInputRootNode,
// 			afterInputRootNode,
// 			beforeInputRanges,
// 			afterInputRanges,
// 		} = selectSnippets(state);
//
// 		const { ranges, content, rootNode } = selectCodemodOutput(state);
//
// 		switch (type) {
// 			case "before":
// 				return {
// 					snippet: inputSnippet,
// 					rootNode: beforeInputRootNode,
// 					ranges: beforeInputRanges,
// 				};
// 			case "after":
// 				return {
// 					snippet: outputSnippet,
// 					rootNode: afterInputRootNode,
// 					ranges: afterInputRanges,
// 				};
//
// 			case "output":
// 				return {
// 					snippet: content,
// 					rootNode,
// 					ranges,
// 				};
//
// 			default:
// 				return {
// 					snippet: "",
// 					rootNode: null,
// 					ranges: [],
// 				};
// 		}
// 	};
//
// export const selectFirstTreeNode =
// 	(type: "before" | "after" | "output") =>
// 	(state: RootState): TreeNode | null => {
// 		const { beforeInputRanges, afterInputRanges } = selectSnippets(state);
// 		const { ranges } = selectCodemodOutput(state);
//
// 		const [firstRange] =
// 			type === "before"
// 				? beforeInputRanges
// 				: type === "after"
// 				  ? afterInputRanges
// 				  : ranges;
//
// 		return firstRange && "id" in firstRange ? firstRange : null;
// 	};
//
// export {
// 	setEngine,
// 	setInput,
// 	setOutput,
// 	selectEngine,
// 	selectSnippets,
// 	selectSnippetsFor,
// 	setInputSelection,
// 	setOutputSelection,
// 	SLICE_KEY,
// };
//
// export type { Engine };
//
// export default snippetsSlice.reducer;
