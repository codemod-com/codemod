import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LLMMessage } from "../types";

export type ChatStore = {
  messages: LLMMessage[];
  appendMessage: (message: LLMMessage) => void;
  reset: () => void;

  isGeneratingCodemod: boolean;
  setIsGeneratingCodemod: (isGenerating: boolean) => void;

  isGeneratingTestCases: boolean;
  setIsGeneratingTestCases: (isGenerating: boolean) => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: get().messages,
      appendMessage: (message) =>
        set({ messages: [...get().messages, message] }),
      reset: () => set({ messages: [] }),

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
