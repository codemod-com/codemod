import { type Node } from "@babel/types";
import create from "zustand";
import type { SendMessageResponse } from "~/api/sendMessage";
import { autoGenerateCodemodPrompt } from "~/store/zustand/CFS/prompts";
import { PromptPreset } from "./prompts";

export const LLM_ENGINES = [
	"gpt-4",
	"claude-2.0",
	"claude-instant-1.2",
	"replit-code-v1-3b",
	"gpt-4-with-chroma",
] as const;

export type Engine = (typeof LLM_ENGINES)[number];

// @TODO move to separate slice after demo
export type AIAssistantState = Readonly<{
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

export const nodeHasValues = (type: Node["type"]): boolean =>
	type === "Identifier" || type === "StringLiteral" || type === "NumberLiteral";

export type CFSStateValues = {
	AIAssistant: AIAssistantState;
};

export type CFSStateSetters = {
	setEngine: (engine: Engine) => void;
};

export type CFSState = CFSStateValues & CFSStateSetters;

export const defaultState: CFSStateValues = {
	AIAssistant: AIAssistantInitialState,
};

export const useCFSStore = create<CFSState>((set, get) => ({
	...defaultState,
	setEngine: (engine: Engine) =>
		set((state) => ({ AIAssistant: { ...state.AIAssistant, engine } })),
}));
