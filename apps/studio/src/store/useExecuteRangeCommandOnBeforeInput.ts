// import { createAsyncThunk } from "@reduxjs/toolkit";
// import type { AppDispatch, RootState } from "~/store";
// import { type RangeCommand, extractIdsAndTypes } from "~/utils/tree";
// import {
// 	type TreeNodeSelectorState,
// 	nodeHasValues,
// 	setNodeSelectorTreeState,
// } from "./slices/CFS";
// import { selectFirstTreeNode, setInputSelection } from "./slices/snippets";
//
// TODO fix import
const states = {
	VALUE: "Value",
	TYPE: "Type",
	UNSELECTED: "Unselected",
} as const;
//
// export const executeRangeCommandOnBeforeInputThunk = createAsyncThunk<
// 	void,
// 	RangeCommand,
// 	{
// 		dispatch: AppDispatch;
// 		state: RootState;
// 	}
// >("thunks/executeRangeCommandOnBeforeInputThunk", async (ranges, thunkAPI) => {
// 	const { dispatch, getState } = thunkAPI;
//
// 	dispatch(setInputSelection(ranges));
//
// 	const firstTreeNode = selectFirstTreeNode("before")(getState());
//
// 	if (firstTreeNode === null) {
// 		return;
// 	}
//
// 	const ids = extractIdsAndTypes(firstTreeNode);
// 	const map: Record<string, TreeNodeSelectorState> = {};
//
// 	ids.forEach(([id, type]) => {
// 		if (nodeHasValues(type)) {
// 			map[id] = states.VALUE;
// 			return;
// 		}
//
// 		map[id] = states.TYPE;
// 	});
//
// 	dispatch(setNodeSelectorTreeState(map));
// });


import { create } from 'zustand'
import { extractIdsAndTypes, RangeCommand } from "~/utils/tree";
import { useSelectFirstTreeNode, useSnippetStore } from "~/store/zustand/snippets";
import { nodeHasValues, TreeNodeSelectorState, useCFSStore } from "~/store/zustand/CFS";

export const useExecuteRangeCommandOnBeforeInput = () => {
		const { setInputSelection } = useSnippetStore.getState();
		const { setNodeSelectorTreeState } = useCFSStore.getState();

		return (ranges:  RangeCommand) => {
			const firstTreeNode = useSelectFirstTreeNode("before")

			if (firstTreeNode === null) {
				return;
			}
			const ids = extractIdsAndTypes(firstTreeNode);
			const map: Record<string, TreeNodeSelectorState> = {};

			ids.forEach(([id, type]) => {
				if (nodeHasValues(type)) {
					map[id] = states.VALUE;
					return;
				}

				map[id] = states.TYPE;
			});

			setInputSelection(ranges);
			setNodeSelectorTreeState(map);
		}
}