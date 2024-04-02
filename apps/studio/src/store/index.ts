/* eslint-disable import/group-exports */
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useStore } from "react-redux";
import CFSReducer, { SLICE_KEY as CFS_SLICE_KEY } from "./slices/CFS";
import { codemodOutputSlice } from "./slices/codemodOutput";
import modReducer, { SLICE_KEY as MOD_SLICE_KEY } from "./slices/mod";
import snippetReducer, {
	SLICE_KEY as SNIPPET_SLICE_KEY,
} from "./slices/snippets";

const store = configureStore({
	reducer: {
		[SNIPPET_SLICE_KEY]: snippetReducer,
		[MOD_SLICE_KEY]: modReducer,
		[CFS_SLICE_KEY]: CFSReducer,
		[codemodOutputSlice.name]: codemodOutputSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppStore: () => typeof store = useStore;

export default store;

export type { RootState, AppDispatch };
