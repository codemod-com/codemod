import { useSnippetStore } from "@studio/store/zustand/snippets";

type WsStatus = "open" | "closed" | "error";
type ExecutionStatus = "not started" | "processing";
const aiWsUrl = "ws://127.0.0.1:8000/ws";

type WSResponse = {
  execution_status: ExecutionStatus;
  message: string;
};
import { useEffect, useRef, useState } from "react";

export const useAiService = () => {
  const [message, setMessage] = useState<ExecutionStatus | null>(null);
  const [wsStatus, setWsStatus] = useState("closed");
  const [executionStatus, setExecutionStatus] = useState("not started");
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
      console.log("vent.data", event.data);
      const data = JSON.parse(event.data) as WSResponse;
      setMessage(data.execution_status);
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
