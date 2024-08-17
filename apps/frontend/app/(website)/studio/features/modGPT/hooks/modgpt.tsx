import { useAuth } from "@clerk/nextjs";
import { useChat } from "ai/react";
import { useEffect } from "react";

import { SEND_CHAT } from "@/app/(website)/studio/src/constants";
import { applyAliases } from "@/app/(website)/studio/src/store/CFS/alias";
import { env } from "@/env";
import type { LLMEngine } from "@codemod-com/utilities";
import { useGetAliases } from "@studio/store/CFS/alias";
import { useChatStore } from "../store/chat-state";

const useInitializeChat = (engine: LLMEngine) => {
  const { chats, setChat, setIsModGptLoading } = useChatStore();
  const { getToken } = useAuth();
  const aliases = useGetAliases();

  useEffect(() => {
    if (chats[engine]) return; // Skip initialization if chat already exists

    const newChat = useChat({
      api: `${env.NEXT_PUBLIC_MODGPT_API_URL}/${SEND_CHAT}`,
      onResponse: (response) => {
        // Handle response if necessary
      },
      body: { engine },
    });

    setChat(engine, {
      ...newChat,
      append: async (message) => {
        const token = await getToken();
        const aliasesAppliedValue = applyAliases(message.content, aliases);

        return newChat.append(
          { content: aliasesAppliedValue, role: "user" },
          {
            options: {
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
            },
          },
        );
      },
    });

    setIsModGptLoading(newChat.isLoading);
  }, [chats, engine, getToken, aliases, setChat, setIsModGptLoading, useChat]);
};

export const useModGPT = (engine: LLMEngine) => {
  const { chats, initializeChat, isModGptLoading } = useChatStore();

  // Get the chat instance for the current engine
  const chat = chats[engine];

  useEffect(() => {
    if (!chat) {
      initializeChat(engine);
    }
  }, [chat, engine, initializeChat]);

  return {
    ...chat,
    isLoading: isModGptLoading,
  };
};

// export const useModGPT = (engine: LLMEngine): ReturnType<typeof useChat> => {
//   const { setIsModGptLoading } = useChatStore();
//   const { getToken } = useAuth();
//   const aliases = useGetAliases();
//   const { chat, initializeChat } = useChatStore();

//   useEffect(() => {
//     setIsModGptLoading(chat?.isLoading ?? false);
//   }, [chat?.isLoading, setIsModGptLoading]);

//   // Create a new chat instance if none exists

//   useEffect(() => {
//     if (!chat) {
//       initializeChat(engine);
//     }
//   }, [chat, engine, initializeChat]);

//   // Save the new chat instance to the Zustand store
//   setChat({
//     ...chat,
//     append: async (message) => {
//       const token = await getToken();
//       const aliasesAppliedValue = applyAliases(message.content, aliases);

//       return chat.append(
//         { content: aliasesAppliedValue, role: "user" },
//         {
//           options: {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: token ? `Bearer ${token}` : "",
//             },
//           },
//         },
//       );
//     },
//   });

//   return chat;
// };
