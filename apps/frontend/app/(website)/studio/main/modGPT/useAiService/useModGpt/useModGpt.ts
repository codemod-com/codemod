import { modGptServer } from "@chatbot/config";
import { onResponse } from "@chatbot/utils";
import { useCFSStore } from "@studio/store/zustand/CFS";
import { useModStore } from "@studio/store/zustand/mod";
import type { Message } from "ai";
import { useChat } from "ai/react";
import { useCallback, useState } from "react";
import {
  getHeadersWithAuth,
  onFinish,
  useHandlePrompt,
  useModMssTimestamps,
} from "./utils";

export const useModGPT = ({
  initialMessages,
  id,
}: { initialMessages: Message[]; id?: string }) => {
  const { command, setCurrentCommand, setContent } = useModStore();
  const {
    AIAssistant: { engine },
  } = useCFSStore();

  const [token, setToken] = useState<string | null>(null);

  const chat = useChat({
    api: modGptServer,
    initialMessages,
    id,
    onFinish: onFinish({ command, setCurrentCommand, setContent }),
    onResponse,
    headers: getHeadersWithAuth(token),
    body: {
      engine,
    },
  });

  useHandlePrompt({ ...chat, id, setToken });

  const modMssTimestamps = useModMssTimestamps({ messages: chat.messages });
  const handleStop = useCallback(() => {
    setCurrentCommand(null);
    stop();
  }, [setCurrentCommand, stop]);

  return {
    modMssTimestamps,
    id,
    handleStop,
    setToken,
    ...chat,
  };
};
