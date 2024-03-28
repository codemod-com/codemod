import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "~/store";
import { type RangeCommand } from "~/utils/tree";
import { setInputSelection } from "./slices/snippets";

// TODO fix import

export const executeRangeCommandOnBeforeInputThunk = createAsyncThunk<
	void,
	RangeCommand,
	{
		dispatch: AppDispatch;
		state: RootState;
	}
>("thunks/executeRangeCommandOnBeforeInputThunk", async (ranges, thunkAPI) => {
	const { dispatch } = thunkAPI;

	dispatch(setInputSelection(ranges));
});
