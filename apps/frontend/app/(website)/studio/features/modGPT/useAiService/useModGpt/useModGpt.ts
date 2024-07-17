import { SEND_CHAT } from "@/app/(website)/studio/src/constants";
import { env } from "@/env";
import { useModGptSubmit } from "@chatbot/useAiService/useModGpt/useModGptSubmit";
import { onResponse } from "@chatbot/utils";
import type { LLMEngine } from "@codemod-com/utilities";
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
    api: `${env.NEXT_PUBLIC_AI_API_URL}/${SEND_CHAT}`,
    initialMessages,
    id,
    onResponse,
    headers: getHeadersWithAuth(token),
    body: {
      engine,
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
