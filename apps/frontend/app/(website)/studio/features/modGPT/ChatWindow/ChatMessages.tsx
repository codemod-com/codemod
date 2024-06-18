import { cn } from "@/utils";
import type { LLMMessage } from "@chatbot/types";
import { Separator } from "@studio/components/ui/separator";
import { ChatMessage } from "./ChatMessage";

interface Props {
  messages: LLMMessage[];
}

export const ChatMessages = ({ messages }: Props) => {
  if (!messages.length) {
    return null;
  }

  const chatPanel = document.getElementsByClassName("chatPanel")?.[0] ?? null;
  return (
    <div
      className={cn("relative mx-auto px-4 pb-[12rem]", {
        // The bottom patting of `ChatList` must match the height of `ChatPanel`.
        // Otherwise, bottom parts of chat will be hidden by the chat panel.
        height: chatPanel === null ? "12rem" : chatPanel.clientHeight,
      })}
    >
      {messages
        .filter(Boolean)
        .filter(({ name }) => name !== "app")
        .map((message, index) => (
          <div key={index}>
            <ChatMessage message={message} />

            {index < messages.length - 1 && (
              <Separator className="my-4 md:my-8" />
            )}
          </div>
        ))}
    </div>
  );
};

ChatMessages.displayName = "ChatList";
