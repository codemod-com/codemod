import { useAuth } from "@/app/auth/useAuth";
import { codemodAiWsServer, shouldUseCodemodAi } from "@chatbot/config";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import type { LLMEngine } from "@shared/consts";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { type Socket, io } from "socket.io-client";

export const useCodemodAI = ({
  messages,
  engine,
}: {
  messages: LLMMessage[];
  engine: LLMEngine;
}) => {
  const [ws, setWs] = useState<Socket | null>(null);
  const [wsMessage, setWsMessage] = useState<MessageFromWs>();
  const { inputSnippet: before, afterSnippet: after } = useSnippetStore();
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [serviceBusy, setServiceBusy] = useState(false);
  const { getToken } = useAuth();
  const handleError = (error: string | Record<string, unknown> | Event) => {
    setServiceBusy(false);
    toast.error(
      `WebSocket Error ${
        error instanceof Object ? JSON.stringify(error) : error
      }`,
    );
  };

  const onConnect = () => {
    console.info("WebSocket connection established");
  };
  const onDisconnect = () => {
    console.info("WebSocket connection ended");
    setIsWsConnected(false);
  };

  const wsCleanup = () => {
    ws?.off("connect", onConnect);
    ws?.off("disconnect", onDisconnect);
    ws?.off("message", onMessage);
    ws?.off("error", handleError);
    setIsWsConnected(false);
    setServiceBusy(false);
  };

  const onMessage = (data: MessageToWs) => {
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

  const handleWebsocketConnection = async () => {
    if (!shouldUseCodemodAi) return;
    setIsWsConnected(true);
    const websocket = io(codemodAiWsServer, {
      auth: { token: await getToken() },
    });
    websocket.on("connect", onConnect);
    websocket.on("disconnect", onDisconnect);
    websocket.on("message", onMessage);
    websocket.on("error", handleError);
    setWs(websocket);
  };

  useEffect(() => {
    handleWebsocketConnection();
    return wsCleanup;
  }, []);

  const startIterativeCodemodGeneration = () => {
    if (ws && before && after && isWsConnected && !serviceBusy) {
      const messageToSend = {
        config: { llm_engine: engine },
        previous_context: messages,
        before,
        after,
      };
      ws.emit("message", messageToSend);
      setServiceBusy(true);
    }
  };

  return {
    stopCodemodAi: () => {
      ws?.disconnect();
      wsCleanup();
      handleWebsocketConnection();
    },
    startIterativeCodemodGeneration,
    wsMessage,
    serviceBusy,
  };
};
