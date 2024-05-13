import { codemodAiWsServer, shouldUseCodemodAi } from "@chatbot/config";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

export const useCodemodAI = ({
  messages,
  canAddMessages,
  setCanAddMessages,
}: {
  messages: LLMMessage[];
  canAddMessages: boolean;
  setCanAddMessages: Dispatch<SetStateAction<boolean>>;
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsMessage, setWsMessage] = useState<MessageFromWs>();
  const { inputSnippet: before, afterSnippet: after } = useSnippetStore();

  useEffect(() => {
    if (!shouldUseCodemodAi) return;
    const websocket = new WebSocket(codemodAiWsServer);
    websocket.onopen = () => console.info("WebSocket connection established");
    websocket.onmessage = async (event) => {
      const data = JSON.parse(event.data) as MessageToWs;
      if (data.codemod) {
        setCanAddMessages(true); // Enable button when codemod is received
        setWsMessage({
          codemod: data.codemod,
          content: `\`\`\`ts ${data.codemod}\`\`\``,
          role: "assistant",
          id: Date.now().toString(),
        });
      } else
        setWsMessage({
          content: data.message,
          role: "assistant",
          id: Date.now().toString(),
        });
    };
    websocket.onerror = (error) => console.log("WebSocket Error:", error);
    setWs(websocket);

    // return () => {
    // 	websocket.close();
    // };
  }, []);

  const startIterativeCodemodGeneration = () => {
    if (ws && ws.readyState === WebSocket.OPEN && canAddMessages) {
      const messageToSend = JSON.stringify({
        previous_context: messages,
        before,
        after,
      });
      ws.send(messageToSend);
      setCanAddMessages(false); // Disable button after sending message
    }
  };

  return {
    startIterativeCodemodGeneration,
    wsMessage,
    canAddMessages,
  };
};
