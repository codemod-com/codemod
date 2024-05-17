import { codemodAiWsServer, shouldUseCodemodAi } from "@chatbot/config";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

export let useCodemodAI = ({
  messages,
  canAddMessages,
  setCanAddMessages,
}: {
  messages: LLMMessage[];
  canAddMessages: boolean;
  setCanAddMessages: Dispatch<SetStateAction<boolean>>;
}) => {
  let [ws, setWs] = useState<WebSocket | null>(null);
  let [wsMessage, setWsMessage] = useState<MessageFromWs>();
  let { inputSnippet: before, afterSnippet: after } = useSnippetStore();

  useEffect(() => {
    if (!shouldUseCodemodAi) return;
    let websocket = new WebSocket(codemodAiWsServer);
    websocket.onopen = () => console.info("WebSocket connection established");
    websocket.onmessage = async (event) => {
      let data = JSON.parse(event.data) as MessageToWs;
      if (data.codemod) {
        setCanAddMessages(true);
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

    return () => {
      websocket.close();
    };
  }, []);

  let startIterativeCodemodGeneration = () => {
    if (ws && ws.readyState === WebSocket.OPEN && canAddMessages) {
      let messageToSend = JSON.stringify({
        previous_context: messages,
        before,
        after,
      });
      ws.send(messageToSend);
      setCanAddMessages(false);
    }
  };

  return {
    startIterativeCodemodGeneration,
    wsMessage,
    canAddMessages,
  };
};
