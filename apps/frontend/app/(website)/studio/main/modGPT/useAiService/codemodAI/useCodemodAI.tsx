import { codemodAiWsServer, shouldUseCodemodAi } from "@chatbot/config";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import type { LLMEngine } from "@shared/consts";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useCodemodAI = ({
  messages,
  engine,
}: {
  messages: LLMMessage[];
  engine: LLMEngine;
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsMessage, setWsMessage] = useState<MessageFromWs>();
  const { inputSnippet: before, afterSnippet: after } = useSnippetStore();
  const [serviceBusy, setServiceBusy] = useState(true);

  const handleError = (error: string) => {
    setServiceBusy(false);
    toast.error(`WebSocket Error ${error}`);
  };
  useEffect(() => {
    if (!shouldUseCodemodAi) return;
    const websocket = new WebSocket(codemodAiWsServer);
    websocket.onopen = () => console.info("WebSocket connection established");
    websocket.onmessage = async (event) => {
      const data = JSON.parse(event.data) as MessageToWs;
      if (data.error || data.execution_status === "error") {
        handleError(data.error || "server crashed");
      } else if (data.codemod) {
        setWsMessage({
          codemod: data.codemod,
          content: `\`\`\`ts ${data.codemod}\`\`\``,
          role: "assistant",
          id: Date.now().toString(),
        });
        setServiceBusy(false);
      } else {
        setWsMessage({
          content: data.message,
          role: "assistant",
          id: Date.now().toString(),
        });
      }
    };
    websocket.onerror = (error) => {
      handleError(String(error));
    };
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const startIterativeCodemodGeneration = () => {
    if (ws && ws.readyState === WebSocket.OPEN && !serviceBusy) {
      const messageToSend = JSON.stringify({
        config: { llm_engine: engine },
        previous_context: messages,
        before,
        after,
      });
      ws.send(messageToSend);
      setServiceBusy(true);
    }
  };

  return {
    setServiceBusy,
    startIterativeCodemodGeneration,
    wsMessage,
    serviceBusy,
  };
};
