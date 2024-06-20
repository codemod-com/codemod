import { cn } from "@/utils";
import { Separator } from "@studio/components/ui/separator";
import type { Message } from "ai";
import { memo } from "react";
import ChatMessage from "./ChatMessage";

interface Props {
  messages: Message[];
}

let ChatList = ({ messages }: Props) => {
  if (!messages.length) {
    return null;
  }

  let chatPanel = document.getElementsByClassName("chatPanel")?.[0] ?? null;

  return (
    <div
      className={cn("relative mx-auto px-4 pb-[12rem]", {
        // The bottom patting of `ChatList` must match the height of `ChatPanel`.
        // Otherwise, bottom parts of chat will be hidden by the chat panel.
        height: chatPanel === null ? "12rem" : chatPanel.clientHeight,
      })}
    >
      {messages.map((message, index) => (
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

ChatList.displayName = "ChatList";

export default memo(ChatList);
