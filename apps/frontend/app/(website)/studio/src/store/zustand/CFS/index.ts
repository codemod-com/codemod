import type { SendMessageResponse } from "@studio/api/sendMessage";
import { autoGenerateCodemodPrompt } from "@studio/store/zustand/CFS/prompts";
import { create } from "zustand";
import type { PromptPreset } from "./prompts";

export let LLM_ENGINES = [
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

let AIAssistantInitialState = {
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

export type CFSStateValues = {
  AIAssistant: AIAssistantState;
};

export type CFSStateSetters = {
  setEngine: (engine: Engine) => void;
};

export type CFSState = CFSStateValues & CFSStateSetters;

export let defaultState: CFSStateValues = {
  AIAssistant: AIAssistantInitialState,
};

export let useCFSStore = create<CFSState>((set, get) => ({
  ...defaultState,
  setEngine: (engine: Engine) =>
    set((state) => ({ AIAssistant: { ...state.AIAssistant, engine } })),
}));
