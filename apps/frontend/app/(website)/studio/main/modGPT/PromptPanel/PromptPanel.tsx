import { AliasButtons } from "@chatbot/PromptPanel/AliasButtons";
import { ControlButtons } from "@chatbot/PromptPanel/ControlButtons";
import { PromptButtons } from "@chatbot/PromptPanel/PromptButtons";
import { WebSocketButton } from "@chatbot/PromptPanel/WebSocketButton";
import { insertValue } from "@chatbot/PromptPanel/utils";
import { shouldUseCodemodAi } from "@chatbot/config";
import type { useAiService } from "@chatbot/useAiService/useAiService";
import { getOrderedAliasList, usePrompts } from "@chatbot/utils";
import { useAuth } from "@clerk/nextjs";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import type { UseChatHelpers } from "ai/react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { PromptForm } from "./PromptForm";
import { ScrollToBottomButton } from "./ScrollToBottomButton";

export type PromptPanelProps = Pick<
  UseChatHelpers,
  | "append"
  | "isLoading"
  | "reload"
  | "messages"
  | "stop"
  | "input"
  | "setInput"
  | "setMessages"
> & {
  id?: string;
  setToken: Dispatch<SetStateAction<string | null>>;
  startIterativeCodemodGeneration: ReturnType<
    typeof useAiService
  >["startIterativeCodemodGeneration"];
  canAddMessages: ReturnType<typeof useAiService>["canAddMessages"];
};

export function PromptPanel(props: PromptPanelProps) {
  const {
    id,
    isLoading,
    stop,
    append,
    input,
    setInput,
    setMessages,
    messages,
    setToken,
    startIterativeCodemodGeneration,
    canAddMessages,
  } = props;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [expandedHelper, setExpandedHelper] = useState(true);
  const { getToken, isSignedIn } = useAuth();
  const aliases = useGetAliases();
  const promptsList = usePrompts(aliases);
  const aliasList = getOrderedAliasList(aliases);

  const handleSubmit = async (value: string) => {
    if (!isLoading) {
      const token = await getToken();
      flushSync(() => setToken(token));
      const aliasesAppliedValue = applyAliases(value, aliases);
      await append({ id, content: aliasesAppliedValue, role: "user" });
    }
  };

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
                canAddMessages={canAddMessages}
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
          onReset={() => setMessages([])}
        />
      </div>
    </div>
  );
}
