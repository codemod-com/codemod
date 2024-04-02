// /* eslint-disable import/group-exports */
// /* eslint-disable no-param-reassign */
// import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
// import type { Event } from "~/schemata/eventSchemata";
// import type { RootState } from "../index";
// import { TabNames, selectActiveTab } from "./view";
// import { useViewStore } from "~/store/zustand/view";
//
// export const SLICE_KEY = "log";
//
// type LogState = Readonly<{
// 	events: ReadonlyArray<Event>;
// 	activeEventHashDigest: string | null;
// 	executionErrorUpdateAt: number;
// }>;
//
// const defaultState: LogState = {
// 	events: [],
// 	activeEventHashDigest: null,
// 	executionErrorUpdateAt: Date.now(),
// };
//
// const logSlice = createSlice({
// 	name: SLICE_KEY,
// 	initialState: defaultState,
// 	reducers: {
// 		setEvents(state, { payload }: PayloadAction<ReadonlyArray<Event>>) {
// 			// @ts-expect-error mutable / immutable conflict
// 			state.events = payload;
//
// 			const executionErrorExists =
// 				payload.find((e) => e.kind === "codemodExecutionError") !== undefined;
//
// 			if (executionErrorExists) {
// 				state.executionErrorUpdateAt = Date.now();
// 			}
// 		},
// 		setActiveEventHashDigest(
// 			state,
// 			action: PayloadAction<LogState["activeEventHashDigest"]>,
// 		) {
// 			state.activeEventHashDigest = action.payload;
// 		},
// 	},
// });
//
// const { setEvents, setActiveEventHashDigest } = logSlice.actions;
//
// export const selectLog = (state: RootState) => state[SLICE_KEY];
//
// export const selectActiveEvent = (state: RootState): Event | null => {
// 	const { activeTab } = useViewStore();
//
// 	if (activeTab !== TabNames.DEBUG) {
// 		return null;
// 	}
//
// 	const { activeEventHashDigest, events } = selectLog(state);
//
// 	if (activeEventHashDigest === null) {
// 		return null;
// 	}
//
// 	return (
// 		events.find(({ hashDigest }) => hashDigest === activeEventHashDigest) ??
// 		null
// 	);
// };
//
// export { setEvents, setActiveEventHashDigest };
//
// export type { Event };
// export default logSlice.reducer;
