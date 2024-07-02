import { cn } from "@/utils";
import type { LLMMessage } from "@chatbot/types";
import { ChatMessages } from "./ChatMessages";
import { ChatScrollAnchor } from "./ChatScrollAnchor";
import { EngineSelector } from "./ModelSelector";
import { WelcomeScreen } from "./WelcomeScreen";

interface ChatWindowProps {
  messages: LLMMessage[];
  isSignedIn: boolean;
  isLoading: boolean;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isSignedIn,
  isLoading,
  className,
}) => {
  return (
    <div className={cn("h-full", className)}>
      {messages.length > 0 && isSignedIn ? (
        <>
          <div className="mb-4 ml-auto w-1/3">
            <EngineSelector />
          </div>
          <ChatMessages messages={messages} />
          <ChatScrollAnchor trackVisibility={isLoading} />
        </>
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};
