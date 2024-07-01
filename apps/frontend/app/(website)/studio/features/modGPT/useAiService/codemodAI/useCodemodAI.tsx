import { useAuth } from "@/app/auth/useAuth";
import { codemodAiWsServer } from "@chatbot/config";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import type { LLMEngine } from "@shared/consts";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import type { ToVoid } from "@studio/types/transformations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { type Socket, io } from "socket.io-client";

type MessageToSend = {
  config: { llm_engine: LLMEngine };
  previous_context: LLMMessage[];
  before: string;
  after: string;
};
export const useCodemodAI = ({
  setToken,
  messages,
  engine,
}: {
  setToken: ToVoid<string | null>;
  messages: LLMMessage[];
  engine: LLMEngine;
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsMessage, setWsMessage] = useState<MessageFromWs>();
  const { inputSnippet: before, afterSnippet: after } = useSnippetStore();
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [serviceBusy, setServiceBusy] = useState(false);
  const { getToken } = useAuth();
  const emitMessage = async (message: MessageToSend) => {
    const _token = await getToken();
    setToken(_token);
    ws?.send(JSON.stringify({ ...message, token: _token }));
    // socket?.emit("message", message);
  };
  const handleError = (error: Record<string, unknown> | Event) => {
    setServiceBusy(false);
    if (error.severity === "user")
      toast.error(
        `WebSocket Error ${
          error instanceof Object
            ? JSON.stringify(error.message) || "websocket crashed"
            : error
        }`,
      );
    else {
      console.error(error);
    }
  };

  const onConnect = () => {
    console.info("WebSocket connection established");
  };
  const onDisconnect = () => {
    console.info("WebSocket connection ended");
    setIsWsConnected(false);
  };

  const wsCleanup = () => {
    ws?.close();
    setIsWsConnected(false);
    setServiceBusy(false);
  };

  const onMessage = async (data: MessageToWs) => {
    if (data.error || data.execution_status === "error") {
      handleError(data);
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
    const websocket = new WebSocket(codemodAiWsServer);
    setIsWsConnected(true);
    setWs(websocket);
    websocket.onopen = onConnect;
    websocket.onmessage = (event) =>
      onMessage(JSON.parse(event.data) as MessageToWs);
    websocket.onerror = handleError;
  };

  useEffect(() => {
    let cleanup = () => {};
    const wsConnect = async () => {
      const _token = await getToken();
      if (_token) {
        handleWebsocketConnection();
        cleanup = wsCleanup;
      }
    };
    wsConnect();
    return () => cleanup();
  }, []);

  const startIterativeCodemodGeneration = async () => {
    if (ws && before && after && isWsConnected && !serviceBusy) {
      const _token = await getToken();
      setToken(_token);
      setWsMessage({
        content: `Generate codemod with AI`,
        role: "user",
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
