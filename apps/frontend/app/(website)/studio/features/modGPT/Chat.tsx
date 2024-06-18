import type { useAiService } from "@chatbot/useAiService";
import { memo } from "react";
import { ChatWindow } from "./ChatWindow";
import { PromptPanel } from "./PromptPanel";

type Props = {
  aiProps: ReturnType<typeof useAiService>;
  className?: string;
  isSignedIn: boolean;
};

const ChatBase = ({
  aiProps: {
    isLoading,
    handleStop,
    reload,
    messages,
    input,
    setInput,
    startIterativeCodemodGeneration,
    resetMessages,
    modGptSubmit,
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
        handleSubmit={modGptSubmit}
        resetMessages={resetMessages}
        isLoading={isLoading}
        stop={handleStop}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        startIterativeCodemodGeneration={startIterativeCodemodGeneration}
      />
    </>
  );
};

ChatBase.displayName = "Chat";
export const Chat = memo(ChatBase);
