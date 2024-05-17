import { buildCodemodFromLLMResponse } from "@chatbot/utils";
import { useAuth } from "@clerk/nextjs";
import {
  freezeMessage,
  parseFrozenMessages,
  unfreezeMessage,
} from "@studio/schemata/chatSchemata";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import { autoGenerateCodemodPrompt } from "@studio/store/zustand/CFS/prompts";
import { type ModState, useModStore } from "@studio/store/zustand/mod";
import type { Message } from "ai";
import type { useChat } from "ai/react/dist";
import { identity } from "ramda";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import toast from "react-hot-toast";

export let useHandlePrompt = ({
  append,
  id,
  isLoading,
  setMessages,
  setToken,
}: {
  id?: string;
  setToken: Dispatch<SetStateAction<string | null>>;
} & Pick<
  ReturnType<typeof useChat>,
  "append" | "isLoading" | "setMessages"
>) => {
  let { command } = useModStore();
  let executedCommand = useRef(false);
  let { getToken, isSignedIn } = useAuth();
  let aliases = useGetAliases();
  let handleSelectPrompt = async (value: string) => {
    let t = await getToken();
    flushSync(() => {
      setToken(t);
    });

    let aliasesAppliedValue = applyAliases(value, aliases);
    await append({
      id,
      content: aliasesAppliedValue,
      role: "user",
      name: "prompt",
    });
  };

  let shouldApplyPrompt = [
    isSignedIn &&
      command === "learn" &&
      aliases.$BEFORE !== null &&
      aliases.$AFTER !== null &&
      !isLoading &&
      !executedCommand.current,
  ].every(identity);

  useEffect(() => {
    if (shouldApplyPrompt) {
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
};

export let useModMssTimestamps = ({ messages }: { messages: Message[] }) => {
  let [modMssTimestamps, setModMssTimestamps] = useState<
    Record<number, Message>
  >({});
  let newMessage = messages?.at(-1);

  useEffect(() => {
    setModMssTimestamps((ct) => ({
      ...ct,
      [Date.now().toString()]: newMessage,
    }));
  }, [newMessage?.id]);
  return modMssTimestamps;
};

export let getHeadersWithAuth = (token: string | null) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

export let onFinish =
  ({
    command,
    setCurrentCommand,
    setContent,
  }: {
    command: string | null;
    setCurrentCommand: ModState["setCurrentCommand"];
    setContent: ModState["setContent"];
  }) =>
  ({ content }: { content: string }) => {
    if (command !== "learn") {
      return;
    }

    setCurrentCommand(null);

    let codemodSourceCode = buildCodemodFromLLMResponse(content);

    if (codemodSourceCode !== null) {
      setContent(codemodSourceCode);

      toast.success("Auto-updated codemod based on AI response.");
    }
  };
