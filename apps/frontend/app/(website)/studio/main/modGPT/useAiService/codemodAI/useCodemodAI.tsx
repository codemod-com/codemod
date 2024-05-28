import { useAuth } from "@/app/auth/useAuth";
import { codemodAiWsServer, shouldUseCodemodAi } from "@chatbot/config";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import type { LLMEngine } from "@shared/consts";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { type Socket, io } from "socket.io-client";

type MessageToSend = {
  config: { llm_engine: "gpt-4-turbo" | "gpt-4" | "gpt-4o" };
  previous_context: LLMMessage[];
  before: string;
  after: string;
};
export const useCodemodAI = ({
  messages,
  engine,
}: {
  messages: LLMMessage[];
  engine: LLMEngine;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsMessage, setWsMessage] = useState<MessageFromWs>();
  const { inputSnippet: before, afterSnippet: after } = useSnippetStore();
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [serviceBusy, setServiceBusy] = useState(false);
  const { getToken } = useAuth();
  const emitMessage = (message: MessageToSend) => {
    ws?.send(JSON.stringify(message));
    // socket?.emit("message", message);
  };
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

  const socketCleanup = () => {
    socket?.off("connect", onConnect);
    socket?.off("disconnect", onDisconnect);
    socket?.off("message", onMessage);
    socket?.off("error", handleError);
    setIsWsConnected(false);
    setServiceBusy(false);
  };

  const wsCleanup = () => {
    ws?.close();
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

  const handleSocketConnection = async () => {
    if (!shouldUseCodemodAi) return;
    setIsWsConnected(true);
    const websocket = io(codemodAiWsServer, {
      auth: { token: await getToken() },
    });
    websocket.on("connect", onConnect);
    websocket.on("disconnect", onDisconnect);
    websocket.on("message", onMessage);
    websocket.on("error", handleError);
    setSocket(websocket);
  };

  const handleWebsocketConnection = async () => {
    if (!shouldUseCodemodAi) return;
    const websocket = new WebSocket(codemodAiWsServer);
    setIsWsConnected(true);
    setWs(websocket);
    websocket.onopen = onConnect;
    websocket.onmessage = (event) =>
      onMessage(JSON.parse(event.data) as MessageToWs);
    websocket.onerror = handleError;
  };

  useEffect(() => {
    handleWebsocketConnection();
    return wsCleanup;
  }, []);

  const startIterativeCodemodGeneration = () => {
    if (ws && before && after && isWsConnected && !serviceBusy) {
      setWsMessage({
        content: `Generate codemod with AI`,
        role: "assistant",
        id: Date.now().toString(),
      });
      const messageToSend: MessageToSend = {
        config: { llm_engine: engine },
        previous_context: messages,
        before,
        after,
      };
      emitMessage(messageToSend);
      setServiceBusy(true);
    }
  };

  return {
    stopCodemodAi: () => {
      socket?.disconnect();
      wsCleanup();
      handleWebsocketConnection();
    },
    startIterativeCodemodGeneration,
    wsMessage,
    serviceBusy,
  };
};
