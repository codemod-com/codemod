import { useAuth } from "@/app/auth/useAuth";
import { useSnippetsStore } from "@studio/store/snippets";

import { useCodemodAi } from "../hooks/codemod-ai";
import { useChatStore } from "../store/chat-state";
import { ChatMessages } from "./ChatWindow/ChatMessages";
import { ChatScrollAnchor } from "./ChatWindow/ChatScrollAnchor";
import { EngineSelector } from "./ChatWindow/ModelSelector";
import { WelcomeScreen } from "./ChatWindow/WelcomeScreen";
import { PromptPanel } from "./PromptPanel";

export const Chat = () => {
  const { getAllSnippets } = useSnippetsStore();
  const { before, after } = getAllSnippets();

  // initializeChat: (engine: LLMEngine) => {
  //   const existingChat = get().chats[engine];

  //   const { getToken } = useAuth();
  //   const aliases = useGetAliases();

  //   const newChat = useChat({
  //     api: `${env.NEXT_PUBLIC_MODGPT_API_URL}/${SEND_CHAT}`,
  //     onResponse: (response) => {
  //       // Handle response
  //     },
  //     body: { engine },
  //   });

  //   set((state) => ({
  //     chats: {
  //       ...state.chats,
  //       [engine]: {
  //         ...newChat,
  //         append: async (message) => {
  //           const token = await getToken();
  //           const aliasesAppliedValue = applyAliases(
  //             message.content,
  //             aliases,
  //           );

  //           return newChat.append(
  //             { content: aliasesAppliedValue, role: "user" },
  //             {
  //               options: {
  //                 headers: {
  //                   "Content-Type": "application/json",
  //                   Authorization: token ? `Bearer ${token}` : "",
  //                 },
  //               },
  //             },
  //           );
  //         },
  //       },
  //     },
  //     isModGptLoading: newChat.isLoading,
  //   }));
  // },
  const { isSignedIn } = useAuth();
  const { messages, appendMessage, isLoading, reset } = useChatStore();

  const { send: autogenerateTestCases } = useCodemodAi({
    data: {
      type: "generate_test",
      before,
      after,
      context: "",
      description: "",
    },
    onFinish: () =>
      appendMessage({
        role: "assistant",
        content: "Codemod created and added to a new tab",
      }),
  });
  const { send: startIterativeCodemodGeneration } = useCodemodAi({
    data: {
      type: "generate_codemod",
      before,
      after,
      context: "",
      description: "",
    },
    onFinish: () =>
      appendMessage({
        role: "assistant",
        content: "Codemod created and added to a new tab",
      }),
  });

  return (
    <div>
      <div className="h-full">
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

      <PromptPanel
      // autogenerateTestCases={autogenerateTestCases}
      // handleSubmit={modGptSubmit}
      // resetMessages={resetMessages}
      // isLoading={isLoading}
      // stop={handleStop}
      // reload={reload}
      // messages={messages}
      // input={input}
      // setInput={setInput}
      // startIterativeCodemodGeneration={startIterativeCodemodGeneration}
      />
    </div>
  );
};
