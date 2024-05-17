import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { useEffect, useRef, useState } from "react";

type ExecutionStatus =
  | "closed"
  | "ready"
  | "in-progress"
  | "error"
  | "finished";
let aiWsUrl = "ws://127.0.0.1:8000/ws";

type WSResponse = {
  execution_status: ExecutionStatus;
  message: string;
  codemod?: string;
};

export let useAiService = () => {
  let [codemod, setCodemod] = useState<string | null>(null);
  let [messageHistory, setMessageHistory] = useState<WSResponse[]>([]);
  let [message, setMessage] = useState<string | null>(null);
  let [wsStatus, setWsStatus] = useState<ExecutionStatus | null>("closed");
  let { inputSnippet, afterSnippet } = useSnippetStore();
  let { setContent } = useModStore();

  let startOver = () => {
    setCodemod(null);
    setMessageHistory([]);
    setMessage(null);
    setWsStatus("ready");
  };
  let applyCodemod = () => codemod && setContent(JSON.stringify(codemod));

  let socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket(aiWsUrl);
    let socket = socketRef.current as WebSocket;

    socket.onopen = () => {
      setWsStatus("ready");
    };

    socket.onmessage = (event) => {
      let data = JSON.parse(event.data) as WSResponse;
      setWsStatus(data.execution_status);
      console.log({ data }, data.codemod);
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

    return () => {
      socket.close();
    };
  }, []);

  let sendSnippets = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      let data = { input: inputSnippet, after: afterSnippet };
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
