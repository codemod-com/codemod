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

import {
	TreeNodeSelectorState,
	nodeHasValues,
	useCFSStore,
} from "~/store/zustand/CFS";
import {
	useSelectFirstTreeNode,
	useSnippetStore,
} from "~/store/zustand/snippets";
import { RangeCommand, extractIdsAndTypes } from "~/utils/tree";

export const useExecuteRangeCommandOnBeforeInput = () => {
	const { setInputSelection } = useSnippetStore();
	const { setNodeSelectorTreeState } = useCFSStore();
	const getFirstTreeNode = useSelectFirstTreeNode();

	return (ranges: RangeCommand) => {
		const firstNode = getFirstTreeNode("before");

		setInputSelection(ranges);

		if (firstNode === null) {
			return;
		}
		const ids = extractIdsAndTypes(firstNode);
		const map: Record<string, TreeNodeSelectorState> = {};

		ids.forEach(([id, type]) => {
			if (nodeHasValues(type)) {
				map[id] = states.VALUE;
				return;
			}

			map[id] = states.TYPE;
		});

		setNodeSelectorTreeState(map);
	};
};
