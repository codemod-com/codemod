import type { SendMessageResponse } from "@studio/api/sendMessage";
import { autoGenerateCodemodPrompt } from "@studio/store/zustand/CFS/prompts";
import { create } from "zustand";
import type { LLMEngine } from "../../../../../../../../shared/consts";
import type { PromptPreset } from "./prompts";

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
  engine: "gpt-4" as const,
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
