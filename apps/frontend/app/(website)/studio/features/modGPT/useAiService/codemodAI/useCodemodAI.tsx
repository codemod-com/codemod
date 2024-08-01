import { useAuth } from "@/app/auth/useAuth";
import { env } from "@/env";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import type { LLMEngine } from "@codemod-com/utilities";
import { useSnippetsStore } from "@studio/store/snippets";
import type { ToVoid } from "@studio/types/transformations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type MessageToSend = {
  config: { llm_engine: LLMEngine; generate_test?: boolean };
  previous_context: LLMMessage[];
  before: string | string[];
  after: string | string[];
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
  const { getAllSnippets, addPair } = useSnippetsStore();
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [serviceBusy, setServiceBusy] = useState(false);
  const { getToken } = useAuth();
  const emitMessage = async (message: MessageToSend) => {
    const _token = await getToken();
    setToken(_token);
    ws?.send(JSON.stringify({ ...message, token: _token }));
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
    if (data.execution_status === "heartbeat") return;
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
    } else if (data.before) {
      setWsMessage({
        content: `Test case created and added to a new test tab`,
        role: "assistant",
        id: Date.now().toString(),
      });
      addPair(undefined, data);
    } else {
      setWsMessage({
        content: data.message,
        role: "assistant",
        id: Date.now().toString(),
      });
    }
  };

  const handleWebsocketConnection = async () => {
    const websocket = new WebSocket(env.NEXT_PUBLIC_WS_URL as string);
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

  const beforeSnippets = getAllSnippets().before;
  const afterSnippets = getAllSnippets().after;

  const isEnvPrepared =
    ws && beforeSnippets.length && afterSnippets.length && isWsConnected;
  const autogenerateTestCases = async () => {
    if (isEnvPrepared) {
      const _token = await getToken();
      setToken(_token);
      setWsMessage({
        content: `Generate test cases`,
        role: "user",
        id: Date.now().toString(),
      });
      const messageToSend: MessageToSend = {
        config: { llm_engine: engine, generate_test: true },
        previous_context: [],
        before: beforeSnippets,
        after: afterSnippets,
      };
      emitMessage(messageToSend);
    }
  };
  const startIterativeCodemodGeneration = async () => {
    if (isEnvPrepared) {
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
        before: beforeSnippets,
        after: afterSnippets,
      };
      emitMessage(messageToSend);
      setServiceBusy(true);
    }
  };

  return {
    stopCodemodAi: () => {
      wsCleanup();
      handleWebsocketConnection();
    },
    startIterativeCodemodGeneration,
    wsMessage,
    serviceBusy,
    autogenerateTestCases,
  };
};
