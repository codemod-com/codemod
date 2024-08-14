import { useAuth } from "@/app/auth/useAuth";
import { LEARN_KEY } from "@/constants";
import { env } from "@/env";
import type { LLMMessage, MessageFromWs, MessageToWs } from "@chatbot/types";
import type { LLMEngine } from "@codemod-com/utilities";
import { useModStore } from "@studio/store/mod";
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
  const { command, setCurrentCommand } = useModStore();
  const { getAllSnippets, addPair } = useSnippetsStore();
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [serviceBusy, setServiceBusy] = useState(false);
  const { getToken } = useAuth();
  const [isTestCaseGenerated, setIsTestCaseGenerated] = useState(false);

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
      setIsTestCaseGenerated(false);
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

  const connectWebSocket = async () => {
    const token = await getToken();
    if (token) {
      const websocket = new WebSocket(env.NEXT_PUBLIC_WS_URL as string);
      setWs(websocket);

      websocket.onopen = () => {
        console.info("WebSocket connection established");
        setIsWsConnected(true);
      };
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

  useEffect(() => {
    connectWebSocket();
  }, []);

  const { before: beforeSnippets, after: afterSnippets } = getAllSnippets();
  const isEnvPrepared =
    ws && beforeSnippets.length && afterSnippets.length && isWsConnected;

  const autogenerateTestCases = async () => {
    if (isEnvPrepared) {
      setIsTestCaseGenerated(true);
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

  const startIterativeCodemodGeneration = async (
    content = `Generate codemod with AI`,
  ) => {
    if (isEnvPrepared) {
      setWsMessage({
        content,
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

  useEffect(() => {
    if (command === LEARN_KEY && isWsConnected) {
      startIterativeCodemodGeneration(
        "Codemod learn: generate codemod with AI",
      );
      setCurrentCommand(null);
    }
  }, [command, isEnvPrepared, isWsConnected]);

  return {
    stopCodemodAi: () => {
      ws?.close();
      connectWebSocket();
      setIsWsConnected(false);
      setServiceBusy(false);
    },
    startIterativeCodemodGeneration,
    wsMessage,
    serviceBusy,
    autogenerateTestCases,
    isTestCaseGenerated,
  };
};
