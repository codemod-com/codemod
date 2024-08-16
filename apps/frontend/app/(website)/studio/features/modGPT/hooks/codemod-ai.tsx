import { useCallback, useEffect } from "react";

import { useAuth } from "@/app/auth/useAuth";
import { env } from "@/env";

import { fetchStream } from "../api/fetch-stream";
import { useChatStore } from "../store/chat-state";
import type {
  CodemodAIFinishedOutput,
  CodemodAIInput,
  CodemodAIOutput,
  CodemodAIProgressOutput,
  CodemodAITestFinishedOutput,
} from "../types";

export function useCodemodAi(settings: {
  input: CodemodAIInput;
  onFinish?: (
    finishMessage: CodemodAITestFinishedOutput | CodemodAIFinishedOutput,
  ) => unknown | Promise<unknown>;
  onError?: (err: string) => void;
  onMessage?: (message: CodemodAIProgressOutput) => unknown | Promise<unknown>;
}) {
  const { input, onFinish, onError, onMessage } = settings;

  const { getToken } = useAuth();
  const {
    setIsGeneratingCodemod,
    setIsGeneratingTestCases,
    isGeneratingCodemod,
    isGeneratingTestCases,
    messages,
    appendMessage,
  } = useChatStore();
  const { signal, abort } = new AbortController();

  useEffect(() => {
    return abort;
  }, [abort]);

  const send = useCallback(async () => {
    const setLoading = (state: boolean) =>
      input.type === "generate_test"
        ? setIsGeneratingTestCases(state)
        : setIsGeneratingCodemod(state);
    const token = await getToken();
    if (token === null) {
      console.error("unauth");
      return;
    }

    setLoading(true);
    await fetchStream({
      url: env.NEXT_PUBLIC_CODEMODAI_API_URL,
      token,
      options: { method: "POST", body: JSON.stringify(input), signal },
      onChunk: async (rawData) => {
        const data = JSON.parse(rawData) as CodemodAIOutput;

        if (data.execution_status === "in_progress") {
          await onMessage?.(data);
          appendMessage({
            role: "assistant",
            content: data.message,
          });
          return;
        }

        if (data.execution_status === "error") {
          await onError?.(data.message);
        } else if (data.execution_status === "finished") {
          await onFinish?.(data);
        }

        setLoading(false);
        return abort();
      },
    });
  }, [
    getToken,
    signal,
    abort,
    setIsGeneratingCodemod,
    setIsGeneratingTestCases,
    input,
    onFinish,
    onError,
    onMessage,
    appendMessage,
  ]);

  return {
    send,
    abort,
    isLoading:
      input.type === "generate_test"
        ? isGeneratingTestCases
        : isGeneratingCodemod,
  };
}
