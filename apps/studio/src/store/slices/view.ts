// import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
// import type { RootState } from "~/store";
//
// export enum TabNames {
// 	MODGPT = "MODGPT",
// 	GUIBuilder = "FIND_AND_REPLACE",
// 	DEBUG = "DEBUG_CONSOLE",
// 	AST = "AST",
// }
//
// type ViewState = Readonly<{
// 	activeTab: TabNames;
// 	astViewCollapsed: boolean;
// }>;
//
// const initialState: ViewState = {
// 	activeTab: TabNames.MODGPT,
// 	astViewCollapsed: true,
// };
//
// export const viewSlice = createSlice({
// 	name: "view",
// 	initialState,
// 	reducers: {
// 		setActiveTab(state, action: PayloadAction<ViewState["activeTab"]>) {
// 			state.activeTab = action.payload;
// 		},
// 		setASTViewCollapsed(state, action: PayloadAction<boolean>) {
// 			state.astViewCollapsed = action.payload;
// 		},
// 	},
// });
//
// export const selectActiveTab = (state: RootState) => state.view.activeTab;
// export const selectASTViewCollapsed = (state: RootState) =>
// 	state.view.astViewCollapsed;
