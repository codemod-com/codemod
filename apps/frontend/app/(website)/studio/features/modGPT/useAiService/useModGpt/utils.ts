import { LEARN_KEY } from "@/constants";
import { useAuth } from "@auth/useAuth";
import { autoGenerateCodemodPrompt } from "@chatbot/prompts";
import { applyAliases, useGetAliases } from "@studio/store/CFS/alias";
import { useModStore } from "@studio/store/mod";
import type { useChat } from "ai/react/dist";
import { identity } from "ramda";
import { type Dispatch, type SetStateAction, useEffect } from "react";
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
      command === LEARN_KEY &&
      aliases.$BEFORE !== null &&
      aliases.$AFTER !== null &&
      !isLoading,
  ].every(identity);

  console.log(
    isSignedIn,
    command === LEARN_KEY,
    aliases.$BEFORE,
    aliases.$AFTER,
  );
  useEffect(() => {
    console.log(
      isSignedIn,
      command === LEARN_KEY,
      aliases.$BEFORE,
      aliases.$AFTER,
    );
    if (shouldApplyPrompt) {
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
