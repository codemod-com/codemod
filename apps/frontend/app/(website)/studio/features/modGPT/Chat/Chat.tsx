import type { useAiService } from "@/app/(website)/studio/features/modgpt/useAiService";
import { memo } from "react";
import { ChatWindow } from "./ChatWindow";
import { PromptPanel } from "./PromptPanel";

type Props = {
  aiProps: ReturnType<typeof useAiService>;
  className?: string;
  isSignedIn: boolean;
};

const ChatBase = ({ className, isSignedIn }: Props) => {
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

  return (
    <>
      <ChatWindow
      // isLoading={isLoading}
      // messages={messages}
      // isSignedIn={isSignedIn}
      // className={className}
      />
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
    </>
  );
};

ChatBase.displayName = "Chat";
export const Chat = memo(ChatBase);
