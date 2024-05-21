import { ChatWindow } from "@chatbot/ChatWindow";
import type { useAiService } from "@chatbot/useAiService";
import { memo } from "react";
import { PromptPanel } from "./PromptPanel";

type Props = {
  aiProps: ReturnType<typeof useAiService>;
  className?: string;
  isSignedIn: boolean;
};

const ChatBase = ({
  aiProps: {
    id,
    isLoading,
    handleStop,
    append,
    reload,
    messages,
    input,
    setInput,
    setMessages,
    setToken,
    canAddMessages,
    startIterativeCodemodGeneration,
    resetMessages,
  },
  className,
  isSignedIn,
}: Props) => {
  return (
    <>
      <ChatWindow
        isLoading={isLoading}
        messages={messages}
        isSignedIn={isSignedIn}
        className={className}
      />
      <PromptPanel
        id={id}
        resetMessages={resetMessages}
        isLoading={isLoading}
        stop={handleStop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        setMessages={setMessages}
        setToken={setToken}
        canAddMessages={canAddMessages}
        startIterativeCodemodGeneration={startIterativeCodemodGeneration}
      />
    </>
  );
};

ChatBase.displayName = "Chat";
export const Chat = memo(ChatBase);
