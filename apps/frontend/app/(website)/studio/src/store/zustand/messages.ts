type Message = {
  content: string;
  role: "function" | "assistant" | "data" | "system" | "user";
  id: string;
  codemod?: string;
};

export type MessageStoreState = {
  messages: Message[];
  engine: string;
  canAddMessages: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  getMessages: () => Message[];
  setEngine: (engine: string) => void;
  getEngine: () => string;
  toggleCanAddMessages: () => void;
  setCanAddMessages: (canAddMessages: boolean) => void;
  updateLastMessage: (content: string) => void;
};
