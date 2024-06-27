import { useAuth } from "@auth/useAuth";
import { autoGenerateCodemodPrompt } from "@chatbot/prompts";
import { applyAliases, useGetAliases } from "@studio/store/CFS/alias";
import { useModStore } from "@studio/store/mod";
import type { useChat } from "ai/react/dist";
import { identity } from "ramda";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { flushSync } from "react-dom";

export const useHandlePrompt = ({
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
  const { command } = useModStore();
  const executedCommand = useRef(false);
  const { getToken, isSignedIn } = useAuth();
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

  const shouldApplyPrompt = [
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

export const getHeadersWithAuth = (token: string | null) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});
