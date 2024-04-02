import { createAsyncThunk } from "@reduxjs/toolkit";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import type { AppDispatch, RootState } from "~/store";
import { useLogStore } from "~/store/zustand/log";
import { type RangeCommand } from "~/utils/tree";
import { executeRangeCommandOnBeforeInputThunk } from "./executeRangeCommandOnBeforeInputThunk";
import { codemodOutputSlice } from "./slices/codemodOutput";
import { setCodemodSelection } from "./slices/mod";
import { setOutputSelection } from "./slices/snippets";

type SetRangeThunkArgument = Readonly<{
	ranges: ReadonlyArray<OffsetRange>;
	target: "CODEMOD_INPUT" | "CODEMOD_OUTPUT" | "BEFORE_INPUT" | "AFTER_INPUT";
}>;

export const setRangeThunk = createAsyncThunk<
	void,
	SetRangeThunkArgument,
	{
		dispatch: AppDispatch;
		state: RootState;
	}
>("thunks/setRangeThunk", async (argument, thunkAPI) => {
	const { dispatch } = thunkAPI;
	const { setActiveEventHashDigest, events } = useLogStore();

	setActiveEventHashDigest(null);

	const rangeCommand: RangeCommand = {
		kind: "FIND_CLOSEST_PARENT",
		ranges: argument.ranges,
	};

	if (argument.target === "CODEMOD_INPUT") {
		dispatch(setCodemodSelection(rangeCommand));
	}

	if (argument.target === "CODEMOD_OUTPUT") {
		dispatch(codemodOutputSlice.actions.setSelections(rangeCommand));
	}

	if (argument.target === "BEFORE_INPUT") {
		dispatch(executeRangeCommandOnBeforeInputThunk(rangeCommand));
	}

	if (argument.target === "AFTER_INPUT") {
		dispatch(setOutputSelection(rangeCommand));
	}
});
