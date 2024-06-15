import type { LLMMessage } from "@chatbot/types";
import { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import { useModGPT } from "@chatbot/useAiService/useModGpt";
import {
  useInitialMss,
  useSaveMssgsToLocalStorage,
} from "@chatbot/useAiService/utils";
import type { LLMEngine } from "@shared/consts";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

let showCodemodCopiedToast = () =>
  toast.success("Codemod copied to the right pane", {
    position: "top-center",
    duration: 12000,
  });
export let useAiService = ({
  setCodemod,
  engine,
}: {
  setCodemod: (content: string) => void;
  engine: LLMEngine;
}) => {
  let initialMessages = useInitialMss();

  let [messages, setMessages] = useState<LLMMessage[]>([]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  let {
    isLoading: modGptLoading,
    modGptSubmit,
    messages: modGPTMessages,
    setMessages: setModGPTMessages,
    append: appendModGPTMessages,
    setToken,
    ...restMod
  } = useModGPT({ initialMessages: [], engine });

  let {
    wsMessage: codemodAIMessage,
    startIterativeCodemodGeneration,
    serviceBusy,
    stopCodemodAi,
  } = useCodemodAI({
    messages,
    engine,
    setToken,
  });

  let lastModGptMss = modGPTMessages?.at(-1);
  let lastMss = messages?.at(-1);

  useEffect(() => {
    if (!codemodAIMessage) return;

    let updateMessages =
      lastMss?.role === "assistant"
        ? () =>
            messages.with(-1, {
              ...lastMss,
              content: `${lastMss.content}\n\n${codemodAIMessage.content}`,
            })
        : (m: LLMMessage[]) => [...m, codemodAIMessage];
    setMessages(updateMessages);

    if (codemodAIMessage.codemod) {
      showCodemodCopiedToast();
      appendModGPTMessages({
        name: "app",
        role: "user",
        content: `This is a codemod generated: ${codemodAIMessage.codemod}. Remember it. Reply with just a single sentence - asking if a user wants to know more about generated codemod"`,
      });
      setCodemod(codemodAIMessage.codemod);
    }
  }, [codemodAIMessage]);

  useEffect(() => {
    if (!lastModGptMss?.content) return;

    let index = messages.findIndex(({ id }) => id === lastModGptMss.id);
    let updateMessages =
      index > -1
        ? () => messages.with(index, lastModGptMss)
        : (m: LLMMessage[]) => [...m, lastModGptMss];
    setMessages(updateMessages);
  }, [lastModGptMss?.content]);

  let resetMessages = () => {
    setMessages([]);
    localStorage.removeItem("frozenMessages");
  };

  let isLoading = serviceBusy || modGptLoading;
  useSaveMssgsToLocalStorage({ messages, isLoading });

  return {
    ...restMod,
    handleStop: () => (serviceBusy ? stopCodemodAi() : restMod.handleStop()),
    resetMessages,
    isLoading,
    messages,
    setMessages,
    modGptSubmit,
    startIterativeCodemodGeneration,
  };
};
