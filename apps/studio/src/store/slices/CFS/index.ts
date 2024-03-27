/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type SendMessageResponse } from "~/api/sendMessage";
import type { RootState } from "~/store";
import { type PromptPreset, autoGenerateCodemodPrompt } from "./prompts";

const SLICE_KEY = "CFS";

const states = {
	VALUE: "Value",
	TYPE: "Type",
	UNSELECTED: "Unselected",
} as const;

type TreeNodeSelectorState = typeof states extends Record<any, infer V>
	? V
	: never;

const ENGINES = [
	"gpt-4",
	"claude-2.0",
	"claude-instant-1.2",
	"replit-code-v1-3b",
	"gpt-4-with-chroma",
] as const;

type Engine = (typeof ENGINES)[number];

// @TODO move to separate slice after demo
type AIAssistantState = Readonly<{
	loading: boolean;
	error: Error | null;
	result: SendMessageResponse | null;
	usersPrompt: string;
	codemodApplied: boolean;
	codemodHasRuntimeErrors: boolean;
	selectedPreset: PromptPreset | null;
	open: boolean;
	engine: Engine;
}>;

type CFSState = {
	AIAssistant: AIAssistantState;
};

const AIAssistantInitialState = {
	loading: false,
	error: null,
	result: null,
	usersPrompt: autoGenerateCodemodPrompt,
	codemodApplied: false,
	codemodHasRuntimeErrors: false,
	selectedPreset: null,
	open: false,
	engine: "gpt-4" as const,
};

const defaultState: CFSState = {
	AIAssistant: AIAssistantInitialState,
};

const CFSSlice = createSlice({
	name: SLICE_KEY,
	initialState: defaultState,
	reducers: {
		setEngine(state, action: PayloadAction<Engine>) {
			state.AIAssistant.engine = action.payload;
		},
	},
});

const { setEngine } = CFSSlice.actions;

const selectEngine = (state: RootState) => state.CFS.AIAssistant.engine;

export { setEngine, selectEngine, SLICE_KEY, ENGINES };

export type { TreeNodeSelectorState, PromptPreset, Engine };

export default CFSSlice.reducer;
