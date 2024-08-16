import { useAuth } from "@/app/auth/useAuth";
import { useSnippetsStore } from "@studio/store/snippets";

import { useCodemodAi } from "../hooks/codemod-ai";
import { useModGPT } from "../hooks/modgpt";
import { useChatStore } from "../store/chat-state";
import { ChatMessages } from "./ChatWindow/ChatMessages";
import { ChatScrollAnchor } from "./ChatWindow/ChatScrollAnchor";
import { EngineSelector } from "./ChatWindow/ModelSelector";
import { WelcomeScreen } from "./ChatWindow/WelcomeScreen";
import { PromptPanel } from "./PromptPanel";

export const Chat = () => {
  const { getAllSnippets } = useSnippetsStore();
  const { before, after } = getAllSnippets();
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

  const { input, setInput, append: modGptSubmit } = useModGPT("gpt-4o");
  const { isSignedIn } = useAuth();

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
