import type { useAiService } from "@/app/(website)/studio/features/modgpt/useAiService";
import { memo } from "react";
import { useCodemodAi } from "../hooks/codemod-ai";
import { useModGPT } from "../hooks/modgpt";
import { ChatWindow } from "./Chat/ChatWindow";
import { PromptPanel } from "./Chat/PromptPanel";

type Props = {
  aiProps: ReturnType<typeof useAiService>;
  className?: string;
  isSignedIn: boolean;
};

const ChatBase = ({ className, isSignedIn }: Props) => {
  // const
  // const aiProps = {
  //   isLoading,
  //   handleStop,
  //   reload,
  //   messages,
  //   input,
  //   setInput,
  //   startIterativeCodemodGeneration,
  //   resetMessages,
  //   modGptSubmit,
  //   autogenerateTestCases,
  // };

  const modGPT = useModGPT("gpt-4o");
  const { send: callCodemodAI, messages } = useCodemodAi("gpt-4o");

  return (
    <>
      <ChatWindow
        isLoading={isLoading}
        messages={messages}
        isSignedIn={isSignedIn}
        className={className}
      />
      <PromptPanel
        autogenerateTestCases={autogenerateTestCases}
        handleSubmit={modGptSubmit}
        resetMessages={resetMessages}
        isLoading={isLoading}
        stop={handleStop}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        startIterativeCodemodGeneration={startIterativeCodemodGeneration}
      />
    </>
  );
};

ChatBase.displayName = "Chat";
export const Chat = memo(ChatBase);
