import type { LLMMessage } from "@chatbot/types";
import { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import { useModGPT } from "@chatbot/useAiService/useModGpt";
import {
  useInitialMss,
  useSaveMssgsToLocalStorage,
} from "@chatbot/useAiService/utils";
import { useEffect, useState } from "react";

export const useAiService = () => {
  // const initialMessages = useInitialMss();

  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [canAddMessages, setCanAddMessages] = useState(true);

  // useEffect(() => {
  //   setMessages(initialMessages);
  // }, [initialMessages]);

  const {
    isLoading,
    messages: modGPTMessages,
    setMessages: setModGPTMessages,
    append: appendModGPTMessages,
    ...restMod
  } = useModGPT({ initialMessages: [] });

  const { wsMessage: codemodAIMessage, startIterativeCodemodGeneration } =
    useCodemodAI({
      messages,
      canAddMessages,
      setCanAddMessages,
    });

  const lastMss = modGPTMessages?.at(-1);

  useEffect(() => {
    if (!codemodAIMessage) return;
    setMessages((m) => [...m, codemodAIMessage]);
    if (codemodAIMessage.codemod) {
      appendModGPTMessages({
        name: "app",
        role: "user",
        content: `This is a codemod generated: ${codemodAIMessage.codemod}. Briefly explain. List item by item. Be very concise, I will add additional questions if needed. Start with "here\'s a breakdown of the codemod"`,
      });
    }
  }, [codemodAIMessage]);

  useEffect(() => {
    if (!lastMss?.content) return;
    const index = messages.findIndex(({ id }) => id === lastMss.id);
    const updateMessages =
      index > -1
        ? () => messages.with(index, lastMss)
        : (m: LLMMessage[]) => [...m, lastMss];
    setMessages(updateMessages);
  }, [lastMss?.content]);

  // useSaveMssgsToLocalStorage({ messages, isLoading });

  return {
    isLoading,
    messages,
    setMessages,
    append: appendModGPTMessages,
    startIterativeCodemodGeneration,
    canAddMessages,
    ...restMod,
  };
};
