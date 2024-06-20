import { useAuth } from "@auth/useAuth";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import { autoGenerateCodemodPrompt } from "@studio/store/zustand/CFS/prompts";
import { useModStore } from "@studio/store/zustand/mod";
import type { useChat } from "ai/react/dist";
import { identity } from "ramda";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { flushSync } from "react-dom";

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

export let getHeadersWithAuth = (token: string | null) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});
