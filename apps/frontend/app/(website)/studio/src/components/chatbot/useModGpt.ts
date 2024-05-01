import { env } from "@/env";
import { useAuth } from "@clerk/nextjs";
import {
  buildCodemodFromLLMResponse,
  onResponse,
} from "@studio/components/chatbot/utils";
import { SEND_CHAT } from "@studio/constants";
import {
  freezeMessage,
  parseFrozenMessages,
  unfreezeMessage,
} from "@studio/schemata/chatSchemata";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import { autoGenerateCodemodPrompt } from "@studio/store/zustand/CFS/prompts";
import { useCodemodExecutionError } from "@studio/store/zustand/log";
import type { Message } from "ai";
import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "react-hot-toast";
import { useCFSStore } from "../../store/zustand/CFS";
import { useModStore } from "../../store/zustand/mod";

export const useModGPT = (id?: string) => {
  const { command, setCurrentCommand, setContent } = useModStore();
  const {
    AIAssistant: { engine },
  } = useCFSStore();

  const executedCommand = useRef(false);

  const [token, setToken] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  useEffect(() => {
    try {
      if (typeof localStorage === "undefined") {
        return setInitialMessages([]);
      }

      const stringifiedFrozenMessages = localStorage.getItem("frozenMessages");

      if (stringifiedFrozenMessages === null) {
        return setInitialMessages([]);
      }

      const messagesToSet = parseFrozenMessages(
        JSON.parse(stringifiedFrozenMessages),
      ).map((frozenMessage) => unfreezeMessage(frozenMessage));
      return setInitialMessages(messagesToSet);
    } catch (error) {
      console.error(error);
      return setInitialMessages([]);
    }
  }, []);

  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    setMessages,
  } = useChat({
    api: `${env.NEXT_PUBLIC_API_URL}${SEND_CHAT}`,
    initialMessages,
    id,
    onFinish({ content }) {
      if (command !== "learn") {
        return;
      }

      setCurrentCommand(null);

      const codemodSourceCode = buildCodemodFromLLMResponse(content);

      if (codemodSourceCode !== null) {
        setContent(codemodSourceCode);

        toast.success("Auto-updated codemod based on AI response.");
      }
    },
    onResponse,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: {
      engine,
    },
  });
  const { getToken, isSignedIn } = useAuth();
  const codemodExecutionError = useCodemodExecutionError();

  const aliases = useGetAliases();

  const handleSelectPrompt = async (value: string) => {
    const t = await getToken();
    flushSync(() => {
      setToken(t);
    });

    const aliasesAppliedValue = applyAliases(value, aliases);
    await append({
      id,
      content: aliasesAppliedValue,
      role: "user",
      name: "prompt",
    });
  };

  useEffect(() => {
    if (
      isSignedIn &&
      command === "learn" &&
      aliases.$BEFORE !== null &&
      aliases.$AFTER !== null &&
      !isLoading &&
      // ensure this block called once
      !executedCommand.current
    ) {
      executedCommand.current = true;
      setMessages([]);
      handleSelectPrompt(autoGenerateCodemodPrompt);
    }
  }, [
    setMessages,
    handleSelectPrompt,
    command,
    aliases.$BEFORE,
    aliases.$AFTER,
    isLoading,
    isSignedIn,
  ]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const frozenMessages = messages.map((message) => freezeMessage(message));

    try {
      localStorage.setItem("frozenMessages", JSON.stringify(frozenMessages));
    } catch (error) {
      console.error(error);
    }
  }, [messages, isLoading]);

  const handleStop = useCallback(() => {
    setCurrentCommand(null);

    stop();
  }, [setCurrentCommand, stop]);
  return {
    id,
    isLoading,
    handleStop,
    append,
    reload,
    messages,
    input,
    setInput,
    setMessages,
    setToken,
  };
};
