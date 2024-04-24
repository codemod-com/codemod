import { useSnippetStore } from "@studio/store/zustand/snippets";

type WsStatus = "open" | "closed" | "error";
type ExecutionStatus = "not started" | "processing";
const aiServiceUrl = "";
const aiWsUrl = "ws://127.0.0.1:8000/ws/status";

import { useEffect, useRef, useState } from "react";

export const useAiService = () => {
  const [message, setMessage] = useState(null);
  const [wsStatus, setWsStatus] = useState("closed");
  const [executionStatus, setExecutionStatus] = useState("available");
  const { inputSnippet, afterSnippet } = useSnippetStore();

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = new WebSocket(aiWsUrl);
    const socket = socketRef.current as WebSocket;

    socket.onopen = () => {
      setWsStatus("open");
    };

    socket.onmessage = (event) => {
      setMessage(event.data);
      setExecutionStatus("processing");
    };

    socket.onclose = () => {
      setMessage(null);
      setWsStatus("closed");
      setExecutionStatus("available");
    };

    socket.onerror = () => {
      setMessage(null);
      setWsStatus("error");
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendSnippets = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const data = { input: inputSnippet, after: afterSnippet };
      console.log({ data });
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not open.");
    }
  };

  return {
    message,
    wsStatus,
    executionStatus,
    sendSnippets,
  };
};
