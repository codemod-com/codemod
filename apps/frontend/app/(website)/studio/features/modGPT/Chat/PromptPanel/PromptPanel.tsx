import { AliasButtons } from "@/app/(website)/studio/features/modgpt/PromptPanel/AliasButtons";
import { ControlButtons } from "@/app/(website)/studio/features/modgpt/PromptPanel/ControlButtons";
import { getOrderedAliasList } from "@/app/(website)/studio/features/modgpt/utils";
import ButtonWithTooltip from "@/app/(website)/studio/src/components/button/BottonWithTooltip";
import { useSnippetsStore } from "@/app/(website)/studio/src/store/snippets";
import { useAuth } from "@clerk/nextjs";
import { useGetAliases } from "@studio/store/CFS/alias";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCodemodAi } from "../../hooks/codemod-ai";
import { useModGPT } from "../../hooks/modgpt";
import { useChatStore } from "../../store/chat-state";
import { PromptForm } from "./PromptForm";
import { ScrollToBottomButton } from "./ScrollToBottomButton";

export function PromptPanel() {
  const {
    reset,
    isGeneratingCodemod,
    isGeneratingTestCases,
    messages,
    appendMessage,
    input,
    setInput,
  } = useChatStore();

  const { getAllSnippets } = useSnippetsStore();

  const { before, after } = getAllSnippets();
  const modGPT = useModGPT("gpt-4o");
  const { send: startCodemodGeneration, abort } = useCodemodAi({
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

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [expandedHelper, setExpandedHelper] = useState(true);
  const { isSignedIn } = useAuth();
  const aliases = useGetAliases();
  const aliasList = getOrderedAliasList(aliases);

  // const handleInsertValue = (value: string) => {
  //   const textArea = textAreaRef.current;
  //   if (textArea) {
  //     const updatedInput = insertValue(textArea, input, value);
  //     setInput(updatedInput);
  //     textArea.focus();
  //   }
  // };

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
          <div className="mb-1 flex w-full gap-1 overflow-x-auto px-1 items-center justify-content-center actions">
            <ButtonWithTooltip
              tooltipContent={
                <>
                  with selected model and Codemod’s iterative AI system.
                  <Link
                    style={{ color: "blue" }}
                    href="https://codemod.com/blog/iterative-ai-system"
                  >
                    {" "}
                    Learn more
                  </Link>
                </>
              }
              variant="default"
              size="sm"
              className="text-white flex gap-1 text-xs my-0 h-8 !py-0 bg-black hover:bg-accent hover:text-black"
              // className="group my-0 h-8 whitespace-nowrap !py-0 text-xs font-bold bg-primary"
              onClick={() => startCodemodGeneration()}
              disabled={isGeneratingCodemod}
            >
              Autogenerate with Codemod AI
            </ButtonWithTooltip>
          </div>
          <AliasButtons
            aliasList={aliasList}
            handleInsertValue={handleInsertValue}
          />
        </>
      )}
      <div className="relative">
        <PromptForm
          ref={textAreaRef}
          input={input}
          setInput={setInput}
          onReset={reset}
        />
      </div>
    </div>
  );
}
