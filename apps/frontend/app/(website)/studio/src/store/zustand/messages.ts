import { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import { useModGPT } from "@chatbot/useAiService/useModGpt";
import { useEffect, useState } from "react";
import { create } from "zustand";

type Message = {
  content: string;
  role: "function" | "assistant" | "data" | "system" | "user";
  id: string;
  codemod?: string;
};

export type MessageStoreState = {
  messages: Message[];
  engine: string;
  canAddMessages: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  getMessages: () => Message[];
  setEngine: (engine: string) => void;
  getEngine: () => string;
  toggleCanAddMessages: () => void;
  setCanAddMessages: (canAddMessages: boolean) => void;
  updateLastMessage: (content: string) => void;
};

export const useMessageStore = create<MessageStoreState>((set, get) => {
  const [messages, setMessages] = useState([]);

  const {
    messages: modGPTMessages,
    setMessages: setModGPTMessages,
    append: appendModGPTMessages,
  } = useModGPT();

  const { wsMessage: codemodAIMessage } = useCodemodAI();

  const lastMss = modGPTMessages?.at(-1);

  useEffect(() => {
    if (!codemodAIMessage) return;
    setMessages((m) => [...m, codemodAIMessage]);
    if (codemodAIMessage.codemod) {
      appendModGPTMessages({
        role: "function",
        content: `This is a codemod generated: ${codemodAIMessage.codemod}. Briefly explain. List item by item.`,
      });
    }
  }, [codemodAIMessage]);

  useEffect(() => {
    if (!lastMss?.content) return;
    const index = modGPTMessages.findIndex(({ id }) => id === lastMss.id);
    const updateMessages =
      index > -1
        ? () => modGPTMessages.with(index, lastMss)
        : (m) => [...m, lastMss];
    setMessages(updateMessages);
  }, [lastMss?.content]);

  return {
    messages,
    engine: "",
    canAddMessages: true,
    addMessage: (message) =>
      set((state) => ({ messages: [...state.messages, message] })),
    setMessages: (messages) => set({ messages }),
    getMessages: () => get().messages,
    setEngine: (engine) => set({ engine }),
    getEngine: () => get().engine,
    setCanAddMessages: (canAddMessages: boolean) =>
      set((state) => ({ canAddMessages })),
    toggleCanAddMessages: () =>
      set((state) => ({ canAddMessages: !state.canAddMessages })),
    updateLastMessage: (content: string) =>
      set((state) => ({
        messages:
          state.messages.length > 0
            ? [
                ...state.messages.slice(0, -1),
                {
                  role: state.messages.at(-1)?.role || "assistant",
                  content: `${
                    state.messages.at(-1)?.content || ""
                  }\n\n${content}`,
                  id: Date.now().toString(),
                },
              ]
            : [
                {
                  content,
                  role: "assistant",
                  id: Date.now().toString(),
                },
              ],
      })),
  };
});
