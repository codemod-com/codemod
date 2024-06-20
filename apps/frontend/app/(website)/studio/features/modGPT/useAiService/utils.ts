import {
  freezeMessage,
  parseFrozenMessages,
  unfreezeMessage,
} from "@studio/schemata/chatSchemata";
import type { Message } from "ai";
import { useEffect, useState } from "react";

export let useInitialMss = () => {
  let [initialMessages, setInitialMessages] = useState<Message[]>([]);
  useEffect(() => {
    let stringifiedFrozenMessages = localStorage?.getItem("frozenMessages");
    try {
      if (!stringifiedFrozenMessages) {
        return setInitialMessages([]);
      }
      let messagesToSet = parseFrozenMessages(
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

export let useSaveMssgsToLocalStorage = ({
  isLoading,
  messages,
}: { isLoading: boolean; messages: Message[] }) => {
  useEffect(() => {
    if (isLoading) {
      return;
    }

    let frozenMessages = messages.map((message) => freezeMessage(message));

    try {
      localStorage.setItem("frozenMessages", JSON.stringify(frozenMessages));
    } catch (error) {
      console.error(error);
    }
  }, [messages, isLoading]);
};
