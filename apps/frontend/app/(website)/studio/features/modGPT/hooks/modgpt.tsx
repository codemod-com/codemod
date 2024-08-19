import { useChat } from "ai/react";

import { SEND_CHAT } from "@/app/(website)/studio/src/constants";
import { env } from "@/env";
import type { LLMEngine } from "@codemod-com/utilities";

// const useInitializeChat = (engine: LLMEngine) => {
//   const { chat, setChat, setIsModGptLoading } = useChatStore();
//   const { getToken } = useAuth();
//   const aliases = useGetAliases();

//   const newChat = useChat({
//     api: `${env.NEXT_PUBLIC_MODGPT_API_URL}/${SEND_CHAT}`,
//   });

//   useEffect(() => {
//     if (chat) return

//     setChat({
//       ...newChat,
//       append: async (message) => {
//         const token = await getToken();
//         const aliasesAppliedValue = applyAliases(message.content, aliases);

//         return chat.append(
//           { content: aliasesAppliedValue, role: "user" },
//           {
//             body: { engine },
//             options: {
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: token ? `Bearer ${token}` : "",
//               },
//             },
//           },
//         );
//       },
//     });

//     setIsModGptLoading(chat.isLoading);
//   }, [chat, engine, getToken, aliases, setChat, setIsModGptLoading, useChat]);
// };

export const useModGPT = (engine: LLMEngine) => {
  return useChat({
    api: `${env.NEXT_PUBLIC_MODGPT_API_URL}/${SEND_CHAT}`,
  });
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
