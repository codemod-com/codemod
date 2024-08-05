import { useAuth } from "@/app/auth/useAuth";
import { env } from "@/env";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import type { LLMEngine } from "@codemod-com/utilities";
import { useSnippetsStore } from "@studio/store/snippets";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type MessageToSend = {
  config: { llm_engine: LLMEngine; generate_test?: boolean };
  previous_context: LLMMessage[];
  before: string[];
  after: string[];
};

export const useCodemodAI = ({
  setToken,
  messages,
  engine,
}: {
  setToken: (token: string | null) => void;
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
    const token = await getToken();
    setToken(token);
    ws?.send(JSON.stringify({ ...message, token }));
  };

  const handleError = (error: any) => {
    setServiceBusy(false);
    if (error.severity === "user") {
      toast.error(`WebSocket Error: ${error.message || "websocket crashed"}`);
    } else {
      console.error(error);
    }
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
        content: `Test cases created and added to a new test tab`,
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

  useEffect(() => {
    const connectWebSocket = async () => {
      const token = await getToken();
      if (token) {
        const websocket = new WebSocket(env.NEXT_PUBLIC_WS_URL as string);
        setWs(websocket);
        setIsWsConnected(true);

        websocket.onopen = () =>
          console.info("WebSocket connection established");
        websocket.onmessage = (event) => onMessage(JSON.parse(event.data));
        websocket.onerror = handleError;
        websocket.onclose = () => setIsWsConnected(false);

        return () => {
          websocket.close();
          setIsWsConnected(false);
          setServiceBusy(false);
        };
      }
    };

    connectWebSocket();
  }, []);

  const { before: beforeSnippets, after: afterSnippets } = getAllSnippets();
  const isEnvPrepared =
    ws && beforeSnippets.length && afterSnippets.length && isWsConnected;

  console.log({
    isEnvPrepared,
    ws,
    isWsConnected,
  });
  const autogenerateTestCases = async () => {
    if (isEnvPrepared) {
      setWsMessage({
        content: `Generate test cases`,
        role: "user",
        id: Date.now().toString(),
      });
      emitMessage({
        config: { llm_engine: engine, generate_test: true },
        previous_context: [],
        before: beforeSnippets,
        after: afterSnippets,
      });
    }
  };

  const startIterativeCodemodGeneration = async () => {
    if (isEnvPrepared) {
      setWsMessage({
        content: `Generate codemod with AI`,
        role: "user",
        id: Date.now().toString(),
      });
      emitMessage({
        config: { llm_engine: engine },
        previous_context: messages,
        before: beforeSnippets,
        after: afterSnippets,
      });
      setServiceBusy(true);
    }
  };

  return {
    stopCodemodAi: () => {
      ws?.close();
      setIsWsConnected(false);
      setServiceBusy(false);
    },
    startIterativeCodemodGeneration,
    wsMessage,
    serviceBusy,
    autogenerateTestCases,
  };
};
