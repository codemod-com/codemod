import { AliasButtons } from "@chatbot/PromptPanel/AliasButtons";
import { ControlButtons } from "@chatbot/PromptPanel/ControlButtons";
import { PromptButtons } from "@chatbot/PromptPanel/PromptButtons";
import { WebSocketButton } from "@chatbot/PromptPanel/WebSocketButton";
import { insertValue } from "@chatbot/PromptPanel/utils";
import { shouldUseCodemodAi } from "@chatbot/config";
import type { useAiService } from "@chatbot/useAiService/useAiService";
import type { useModGptSubmit } from "@chatbot/useAiService/useModGpt/useModGptSubmit";
import { getOrderedAliasList, usePrompts } from "@chatbot/utils";
import { useAuth } from "@clerk/nextjs";
import { useGetAliases } from "@studio/store/CFS/alias";
import type { UseChatHelpers } from "ai/react";
import { useRef, useState } from "react";
import { PromptForm } from "./PromptForm";
import { ScrollToBottomButton } from "./ScrollToBottomButton";

export type PromptPanelProps = Pick<
  UseChatHelpers,
  "isLoading" | "reload" | "messages" | "stop" | "input" | "setInput"
> & {
  handleSubmit: ReturnType<typeof useModGptSubmit>;
  startIterativeCodemodGeneration: ReturnType<
    typeof useAiService
  >["startIterativeCodemodGeneration"];
  resetMessages: ReturnType<typeof useAiService>["resetMessages"];
};

export function PromptPanel(props: PromptPanelProps) {
  const {
    handleSubmit,
    isLoading,
    stop,
    input,
    setInput,
    messages,
    startIterativeCodemodGeneration,
    resetMessages,
  } = props;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [expandedHelper, setExpandedHelper] = useState(true);
  const { isSignedIn } = useAuth();
  const aliases = useGetAliases();
  const promptsList = usePrompts(aliases);
  const aliasList = getOrderedAliasList(aliases);

  const handleInsertValue = (value: string) => {
    const textArea = textAreaRef.current;
    if (textArea) {
      const updatedInput = insertValue(textArea, input, value);
      setInput(updatedInput);
      textArea.focus();
    }
  };

  return (
    <div className="chatPanel absolute bottom-0 mx-auto w-full sm:pl-8 sm:pr-16">
      {isSignedIn && messages.length > 0 && <ScrollToBottomButton />}
      <ControlButtons
        isLoading={isLoading}
        stop={stop}
        expandedHelper={expandedHelper}
        toggleHelper={() => setExpandedHelper(!expandedHelper)}
      />
      {expandedHelper && (
        <>
          <PromptButtons promptsList={promptsList} handleSubmit={handleSubmit}>
            {shouldUseCodemodAi && (
              <WebSocketButton
                handleButtonClick={startIterativeCodemodGeneration}
                isLoading={isLoading}
              />
            )}
          </PromptButtons>
          <AliasButtons
            aliasList={aliasList}
            handleInsertValue={handleInsertValue}
          />
        </>
      )}
      <div className="relative">
        <PromptForm
          ref={textAreaRef}
          onSubmit={handleSubmit}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onReset={resetMessages}
        />
      </div>
    </div>
  );
}
