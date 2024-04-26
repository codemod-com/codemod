import { useSnippetStore } from "@studio/store/zustand/snippets";

type WsStatus = "open" | "closed" | "error";
type ExecutionStatus = "not started" | "processing";
const aiWsUrl = "ws://127.0.0.1:8000/ws";

type WSResponse = {
  execution_status: ExecutionStatus;
  message: string;
  codemod?: string;
};
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useEffect, useRef, useState } from "react";

export const useAiService = () => {
  const [codemod, setCodemod] = useState<string | null>(null);
  const [messageHistory, setMessageHistory] = useState<WSResponse[]>([]);
  const [message, setMessage] = useState<ExecutionStatus | null>(null);
  const [wsStatus, setWsStatus] = useState("closed");
  const { inputSnippet, afterSnippet } = useSnippetStore();
  const { setContent } = useCodemodOutputStore();
  const startOver = () => {
    setCodemod(null);
    setMessageHistory([]);
    setMessage(null);
    setWsStatus("open");
  };
  const applyCodemod = () => codemod && setContent(codemod);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket(aiWsUrl);
    const socket = socketRef.current as WebSocket;

    socket.onopen = () => {
      setWsStatus("ready");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WSResponse;
      setMessage(data.execution_status);
      setWsStatus("processing");
      setMessageHistory((prev) => [...prev, data]);
      if (data.codemod) {
        setCodemod(data.codemod);
        setWsStatus("finished");
      }
    };

    socket.onclose = () => {
      setMessage(null);
      setWsStatus("error");
    };

    socket.onerror = () => {
      setMessage(null);
      setWsStatus("error");
    };
  }, []);

  const sendSnippets = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const data = { input: inputSnippet, after: afterSnippet };
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not open.");
    }
  };

  return {
    message,
    wsStatus,
    sendSnippets,
    messageHistory,
    codemod,
    applyCodemod,
    startOver,
  };
};
