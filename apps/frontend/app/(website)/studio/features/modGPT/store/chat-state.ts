import { SEND_CHAT } from "@/app/(website)/studio/src/constants";
import { applyAliases } from "@/app/(website)/studio/src/store/CFS/alias";
import { env } from "@/env";
import { useAuth } from "@clerk/nextjs";
import type { LLMEngine } from "@codemod-com/utilities";
import { useGetAliases } from "@studio/store/CFS/alias";
import { useChat } from "ai/react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LLMMessage } from "../types";

export type ChatStore = {
  chats: Record<string, ReturnType<typeof useChat>>;
  setChat: (engine: LLMEngine, chat: ReturnType<typeof useChat>) => void;

  messages: Array<{ engine: LLMEngine; message: LLMMessage }>;
  appendMessage: (message: LLMMessage) => void;
  reset: (engine: LLMEngine) => void;

  isLoading: boolean;

  isModGptLoading: boolean;
  setIsModGptLoading: (isModGptLoading: boolean) => void;

  isGeneratingCodemod: boolean;
  setIsGeneratingCodemod: (isGenerating: boolean) => void;

  isGeneratingTestCases: boolean;
  setIsGeneratingTestCases: (isGenerating: boolean) => void;

  initializeChat: (engine: LLMEngine) => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: {},
      setChat: (engine, chat) =>
        set((state) => ({
          chats: { ...state.chats, [engine]: chat },
        })),

      messages: [],
      appendMessage: (message) =>
        set((state) => [...(state.messages || []), message]),
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

      initializeChat: (engine: LLMEngine) => {
        const existingChat = get().chats[engine];

        const { getToken } = useAuth();
        const aliases = useGetAliases();

        const newChat = useChat({
          api: `${env.NEXT_PUBLIC_MODGPT_API_URL}/${SEND_CHAT}`,
          onResponse: (response) => {
            // Handle response
          },
          body: { engine },
        });

        set((state) => ({
          chats: {
            ...state.chats,
            [engine]: {
              ...newChat,
              append: async (message) => {
                const token = await getToken();
                const aliasesAppliedValue = applyAliases(
                  message.content,
                  aliases,
                );

                return newChat.append(
                  { content: aliasesAppliedValue, role: "user" },
                  {
                    options: {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                      },
                    },
                  },
                );
              },
            },
          },
          isModGptLoading: newChat.isLoading,
        }));
      },
    }),
    { name: "chat-store", storage: createJSONStorage(() => sessionStorage) },
  ),
);
