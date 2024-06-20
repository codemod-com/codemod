import { useAuth } from "@/app/auth/useAuth";
import { codemodAiWsServer, shouldUseCodemodAi } from "@chatbot/config";
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
export let useCodemodAI = ({
  setToken,
  messages,
  engine,
}: {
  setToken: ToVoid<string | null>;
  messages: LLMMessage[];
  engine: LLMEngine;
}) => {
  let [socket, setSocket] = useState<Socket | null>(null);
  let [ws, setWs] = useState<WebSocket | null>(null);
  let [wsMessage, setWsMessage] = useState<MessageFromWs>();
  let { inputSnippet: before, afterSnippet: after } = useSnippetStore();
  let [isWsConnected, setIsWsConnected] = useState(false);
  let [serviceBusy, setServiceBusy] = useState(false);
  let { getToken } = useAuth();
  let emitMessage = (message: MessageToSend) => {
    ws?.send(JSON.stringify(message));
    // socket?.emit("message", message);
  };
  let handleError = (error: string | Record<string, unknown> | Event) => {
    setServiceBusy(false);
    toast.error(
      `WebSocket Error ${
        error instanceof Object ? JSON.stringify(error) : error
      }`,
    );
  };

  let onConnect = () => {
    console.info("WebSocket connection established");
  };
  let onDisconnect = () => {
    console.info("WebSocket connection ended");
    setIsWsConnected(false);
  };

  let socketCleanup = () => {
    socket?.off("connect", onConnect);
    socket?.off("disconnect", onDisconnect);
    socket?.off("message", onMessage);
    socket?.off("error", handleError);
    setIsWsConnected(false);
    setServiceBusy(false);
  };

  let wsCleanup = () => {
    ws?.close();
    setIsWsConnected(false);
    setServiceBusy(false);
  };

  let onMessage = async (data: MessageToWs) => {
    let _token = await getToken();
    setToken(_token);
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

  let handleSocketConnection = async () => {
    if (!shouldUseCodemodAi) return;
    setIsWsConnected(true);
    let websocket = io(codemodAiWsServer, {
      auth: { token: await getToken() },
    });
    websocket.on("connect", onConnect);
    websocket.on("disconnect", onDisconnect);
    websocket.on("message", onMessage);
    websocket.on("error", handleError);
    setSocket(websocket);
  };

  let handleWebsocketConnection = async () => {
    if (!shouldUseCodemodAi) return;
    let websocket = new WebSocket(codemodAiWsServer);
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

  let startIterativeCodemodGeneration = async () => {
    if (ws && before && after && isWsConnected && !serviceBusy) {
      let _token = await getToken();
      setToken(_token);
      setWsMessage({
        content: `Generate codemod with AI`,
        role: "user",
        id: Date.now().toString(),
      });
      let messageToSend: MessageToSend = {
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
