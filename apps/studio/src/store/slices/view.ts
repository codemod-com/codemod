/* eslint-disable import/group-exports */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '~/store';
import { DEFAULT_SNIPPET_NAME } from './snippets';

export const enum TabNames {
	MODGPT = 'MODGPT',
	GUIBuilder = 'FIND_AND_REPLACE',
	DEBUG = 'DEBUG_CONSOLE',
}

type ViewState = Readonly<{
	activeTab: TabNames;
	activeSnippet: string;
	astViewCollapsed: boolean;
}>;

const initialState: ViewState = {
	activeTab: TabNames.MODGPT,
	activeSnippet: DEFAULT_SNIPPET_NAME,
	astViewCollapsed: true,
};

export const viewSlice = createSlice({
	name: 'view',
	initialState,
	reducers: {
		setActiveTab(state, action: PayloadAction<ViewState['activeTab']>) {
			// eslint-disable-next-line no-param-reassign
			state.activeTab = action.payload;
		},
		setASTViewCollapsed(state, action: PayloadAction<boolean>) {
			// eslint-disable-next-line no-param-reassign
			state.astViewCollapsed = action.payload;
		},
		setActiveSnippet(state, action: PayloadAction<string>) {
			// eslint-disable-next-line no-param-reassign
			state.activeSnippet = action.payload;
		},
	},
});

export const selectActiveTab = (state: RootState) => state.view.activeTab;
export const selectActiveSnippet = (state: RootState) =>
	state.view.activeSnippet;
export const selectASTViewCollapsed = (state: RootState) =>
	state.view.astViewCollapsed;
