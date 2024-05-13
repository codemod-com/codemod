import {
  freezeMessage,
  parseFrozenMessages,
  unfreezeMessage,
} from "@studio/schemata/chatSchemata";
import type { Message } from "ai";
import { useEffect, useState } from "react";

export const useInitialMss = () => {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  useEffect(() => {
    const stringifiedFrozenMessages = localStorage?.getItem("frozenMessages");
    try {
      if (!stringifiedFrozenMessages) {
        return setInitialMessages([]);
      }
      const messagesToSet = parseFrozenMessages(
        JSON.parse(stringifiedFrozenMessages),
      ).map(unfreezeMessage);
      return setInitialMessages(messagesToSet);
    } catch (error) {
      console.error(error);
      return setInitialMessages([]);
    }
  }, []);
  return initialMessages;
};

export const useSaveMssgsToLocalStorage = ({
  isLoading,
  messages,
}: { isLoading: boolean; messages: Message[] }) => {
  useEffect(() => {
    if (isLoading || messages.length === 0) {
      return;
    }

    const frozenMessages = messages.map((message) => freezeMessage(message));

    try {
      localStorage.setItem("frozenMessages", JSON.stringify(frozenMessages));
    } catch (error) {
      console.error(error);
    }
  }, [messages, isLoading]);
};
