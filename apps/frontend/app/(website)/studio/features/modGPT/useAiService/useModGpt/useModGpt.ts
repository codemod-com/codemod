import { modGptServer, shouldUseCodemodAi } from "@chatbot/config";
import { useModGptSubmit } from "@chatbot/useAiService/useModGpt/useModGptSubmit";
import { onResponse } from "@chatbot/utils";
import type { LLMEngine } from "@shared/consts";
import { useModStore } from "@studio/store/mod";
import type { Message } from "ai";
import { useChat } from "ai/react";
import { useCallback, useState } from "react";
import { getHeadersWithAuth, useHandlePrompt } from "./utils";

export const useModGPT = ({
  initialMessages,
  id,
  engine,
}: { initialMessages: Message[]; id?: string; engine: LLMEngine }) => {
  const { setCurrentCommand } = useModStore();

  const [token, setToken] = useState<string | null>(null);
  const chat = useChat({
    api: modGptServer,
    initialMessages,
    id,
    onResponse,
    headers: getHeadersWithAuth(token),
    body: {
      engine: shouldUseCodemodAi ? "gpt-4" : engine,
    },
  });

  useHandlePrompt({ ...chat, id, setToken });
  const modGptSubmit = useModGptSubmit({ id, setToken, ...chat });

  const handleStop = useCallback(() => {
    setCurrentCommand(null);
    global.stop();
  }, [setCurrentCommand, global.stop]);

  return {
    id,
    handleStop,
    setToken,
    modGptSubmit,
    ...chat,
  };
};
