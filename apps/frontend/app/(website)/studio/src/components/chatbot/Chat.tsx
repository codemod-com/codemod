import { cn } from "@/utils";
import type { useModGPT } from "@studio/components/chatbot/useModGpt";
import ChatList from "./ChatList";
import { ChatPanel } from "./ChatPanel";
import ChatScrollAnchor from "./ChatScrollAnchor";
import EngineSelector from "./ModelSelector";
import WelcomeScreen from "./WelcomeScreen";

type Props = {
  modGPT: ReturnType<typeof useModGPT>;
  className?: string;
  isSignedIn: boolean;
};

const Chat = ({
  modGPT: {
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
  },
  className,
  isSignedIn,
}: Props) => {
  return (
    <>
      <div className={cn("h-full", className)}>
        {messages.length > 0 && isSignedIn ? (
          <>
            <div className="mb-4 ml-auto w-1/3">
              <EngineSelector />
            </div>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={handleStop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        setMessages={setMessages}
        setToken={setToken}
      />
    </>
  );
};

Chat.displayName = "Chat";

export default Chat;
