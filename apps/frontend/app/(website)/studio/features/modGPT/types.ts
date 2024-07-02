import type { Message } from "ai";

export type LLMMessage = {
  content: string;
  role: "function" | "assistant" | "data" | "system" | "user";
  id: string;
  codemod?: string;
  name?: string;
};

export type MessageToWs = {
  execution_status: "in-progress" | "finished" | "error";
  message: string;
  error?: string;
  codemod?: string;
  id: string;
};

export type MessageFromWs = Message & { codemod?: string };
