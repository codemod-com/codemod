// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
// import type { AppDispatch, RootState } from "~/zustand";
// import { useLogStore } from "~/zustand/zustand/log";
// import { type RangeCommand } from "~/utils/tree";
// import { executeRangeCommandOnBeforeInputThunk } from "./useExecuteRangeCommandOnBeforeInput";
// import { codemodOutputSlice } from "./slices/codemodOutput";
// import { setCodemodSelection } from "./slices/mod";
// import { setOutputSelection } from "./slices/snippets";
//
// type SetRangeThunkArgument = Readonly<{
// 	ranges: ReadonlyArray<OffsetRange>;
// 	target: "CODEMOD_INPUT" | "CODEMOD_OUTPUT" | "BEFORE_INPUT" | "AFTER_INPUT";
// }>;
//
// export const setRangeThunk = createAsyncThunk<
// 	void,
// 	SetRangeThunkArgument,
// 	{
// 		dispatch: AppDispatch;
// 		state: RootState;
// 	}
// >("thunks/setRangeThunk", async (argument, thunkAPI) => {
// 	const { dispatch } = thunkAPI;
// 	const { setActiveEventHashDigest, events } = useLogStore();
//
// 	setActiveEventHashDigest(null);
//
// 	const rangeCommand: RangeCommand = {
// 		kind: "FIND_CLOSEST_PARENT",
// 		ranges: argument.ranges,
// 	};
//
// 	if (argument.target === "CODEMOD_INPUT") {
// 		dispatch(setCodemodSelection(rangeCommand));
// 	}
//
// 	if (argument.target === "CODEMOD_OUTPUT") {
// 		dispatch(codemodOutputSlice.actions.setSelections(rangeCommand));
// 	}
//
// 	if (argument.target === "BEFORE_INPUT") {
// 		dispatch(executeRangeCommandOnBeforeInputThunk(rangeCommand));
// 	}
//
// 	if (argument.target === "AFTER_INPUT") {
// 		dispatch(setOutputSelection(rangeCommand));
// 	}
// });

import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { type RangeCommand } from "~/utils/tree";
import { useCodemodOutputStore } from "~/zustand/stores/codemodOutput";
import { useLogStore } from "~/zustand/stores/log";
import { useModStore } from "~/zustand/stores/mod";
import { useSnippetStore } from "~/zustand/stores/snippets";
import { useExecuteRangeCommandOnBeforeInput } from "~/zustand/utils/useExecuteRangeCommandOnBeforeInput";

type UseRange = Readonly<{
	ranges: ReadonlyArray<OffsetRange>;
	target: "CODEMOD_INPUT" | "CODEMOD_OUTPUT" | "BEFORE_INPUT" | "AFTER_INPUT";
}>;

export const useRangesOnTarget = () => {
	const { setActiveEventHashDigest } = useLogStore();
	const { setCodemodSelection } = useModStore();
	const { setSelections } = useCodemodOutputStore();
	const setRanges = useExecuteRangeCommandOnBeforeInput();
	const { setOutputSelection } = useSnippetStore();
	return ({ ranges, target }: UseRange) => {
		setActiveEventHashDigest(null);

		const rangeCommand: RangeCommand = {
			kind: "FIND_CLOSEST_PARENT",
			ranges,
		};

		switch (target) {
			case "CODEMOD_INPUT":
				setCodemodSelection(rangeCommand);
				break;
			case "CODEMOD_OUTPUT":
				setSelections(rangeCommand);
				break;
			case "BEFORE_INPUT":
				setRanges(rangeCommand);
				break;
			case "AFTER_INPUT":
				setOutputSelection(rangeCommand);
				break;
		}
	};
};
