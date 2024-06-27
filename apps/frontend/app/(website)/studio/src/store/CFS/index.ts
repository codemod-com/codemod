import { shouldUseCodemodAi } from "@chatbot/config";
import type { PromptPreset } from "@chatbot/prompts";
import { autoGenerateCodemodPrompt } from "@chatbot/prompts";
import type { LLMEngine } from "@shared/consts";
import type { SendMessageResponse } from "@studio/api/sendMessage";
import { create } from "zustand";

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
  engine: LLMEngine;
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
  engine: shouldUseCodemodAi ? "gpt-4o" : ("gpt-4" as const),
};

export type CFSStateValues = {
  AIAssistant: AIAssistantState;
};

export type CFSStateSetters = {
  setEngine: (engine: LLMEngine) => void;
};

export type CFSState = CFSStateValues & CFSStateSetters;

export const defaultState: CFSStateValues = {
  AIAssistant: AIAssistantInitialState,
};

export const useCFSStore = create<CFSState>((set, get) => ({
  ...defaultState,
  setEngine: (engine: LLMEngine) =>
    set((state) => ({ AIAssistant: { ...state.AIAssistant, engine } })),
}));
