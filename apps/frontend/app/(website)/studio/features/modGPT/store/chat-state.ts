import type { LLMEngine } from "@codemod-com/utilities";
import type { useChat } from "ai/react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LLMMessage } from "../types";

export type ChatStore = {
  chat: ReturnType<typeof useChat> | null;
  setChat: (chat: ReturnType<typeof useChat>) => void;

  messages: LLMMessage[];
  appendMessage: (message: LLMMessage) => void;
  reset: (engine: LLMEngine) => void;

  isLoading: boolean;

  isModGptLoading: boolean;
  setIsModGptLoading: (isModGptLoading: boolean) => void;

  isGeneratingCodemod: boolean;
  setIsGeneratingCodemod: (isGenerating: boolean) => void;

  isGeneratingTestCases: boolean;
  setIsGeneratingTestCases: (isGenerating: boolean) => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chat: null,
      setChat: (chat) => set((state) => ({ ...state, chat })),

      messages: [],
      appendMessage: (message) =>
        set((state) => ({
          ...state,
          messages: [...(state.messages || []), message],
        })),
      reset: (engine) =>
        set((state) => ({
          messages: { ...state.messages, [engine]: [] },
        })),

      isLoading:
        get().isGeneratingCodemod ||
        get().isGeneratingTestCases ||
        get().isModGptLoading,

      isModGptLoading: false,
      setIsModGptLoading: (isModGptLoading) => set({ isModGptLoading }),

      isGeneratingCodemod: false,
      setIsGeneratingCodemod: (isGenerating) =>
        set({ isGeneratingCodemod: isGenerating }),

      isGeneratingTestCases: false,
      setIsGeneratingTestCases: (isGenerating) =>
        set({ isGeneratingTestCases: isGenerating }),
    }),
    { name: "chat-store", storage: createJSONStorage(() => sessionStorage) },
  ),
);
