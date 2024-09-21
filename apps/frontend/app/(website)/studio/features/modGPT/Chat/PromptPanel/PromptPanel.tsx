import { useAuth } from "@clerk/nextjs";
import {
  ArrowDown as ArrowDownIcon,
  BracketsCurly,
  MagicWand,
  Stop as StopIcon,
} from "@phosphor-icons/react";
// import { AliasButtons } from "@/app/(website)/studio/features/modgpt/PromptPanel/AliasButtons";
// import { ControlButtons } from "@/app/(website)/studio/features/modgpt/PromptPanel/ControlButtons";
// import { getOrderedAliasList } from "@/app/(website)/studio/features/modgpt/utils";
// import ButtonWithTooltip from "@/app/(website)/studio/src/components/button/BottonWithTooltip";
// import { useSnippetsStore } from "@/app/(website)/studio/src/store/snippets";
import Link from "next/link";
import { useRef, useState } from "react";

import { cn } from "@/utils";
import { getOrderedAliasList } from "@features/modgpt/utils";
import ButtonWithTooltip from "@studio/components/button/BottonWithTooltip";
import { Button, type ButtonProps } from "@studio/components/ui/button";
import { useScrollToBottomDetector } from "@studio/hooks/useScrollToBottomDetector";
import { useGetAliases } from "@studio/store/CFS/alias";
import { useSnippetsStore } from "@studio/store/snippets";
import { capitalizeWord } from "@studio/utils/string";
import { useCodemodAi } from "../../hooks/codemod-ai";
import { useModGPT } from "../../hooks/modgpt";
import { useChatStore } from "../../store/chat-state";
import { PromptForm } from "./PromptForm";

export const ScrollToBottomButton = ({ className, ...props }: ButtonProps) => {
  const scrollWindow =
    document.getElementsByClassName("scrollWindow")?.[0] ?? null;
  const isAtBottom = useScrollToBottomDetector(scrollWindow);

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-4 bg-background transition-opacity duration-300",
        isAtBottom ? "opacity-0" : "opacity-100",
        className,
      )}
      onClick={() =>
        scrollWindow?.scrollTo({
          top: scrollWindow?.scrollHeight,
          behavior: "smooth",
        })
      }
      {...props}
    >
      <ArrowDownIcon />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
};

type ControlButtonsProps = {
  stop: () => void;
  expandedHelper: boolean;
  toggleHelper: () => void;
};

export const ControlButtons = ({
  stop,
  expandedHelper,
  toggleHelper,
}: ControlButtonsProps) => {
  const { isLoading } = useChatStore();
  const { stop } = useModGPT("gpt-4o");

  return (
    <div className="flex h-10 items-center justify-center m-2">
      {isLoading && (
        <Button variant="outline" onClick={stop} className="bg-background">
          <StopIcon className="mr-2" />
          Stop generating
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        title={
          expandedHelper
            ? "Hide recommended prompts & aliases"
            : "Show recommended prompts & aliases"
        }
        onClick={toggleHelper}
        className={cn(
          "absolute right-[-65px] top-[10px]",
          expandedHelper && "bg-accent",
        )}
      >
        <MagicWand />
      </Button>
    </div>
  );
};

type AliasButtonsProps = {
  aliasList: string[][];
  handleInsertValue: (value: string) => void;
};

export function PromptPanel() {
  const { isGeneratingCodemod, isLoading, messages, appendMessage } =
    useChatStore();

  const { getAllSnippets } = useSnippetsStore();
  const { before, after } = getAllSnippets();

  // maybe move input to global store.
  const { input, setInput } = useModGPT("gpt-4o");
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

          <div className="flex w-full gap-1 overflow-x-auto px-1 items-center justify-content-center prompt-builders">
            {aliasList.map(([label, value]) => (
              <Button
                variant="outline"
                size="sm"
                key={label}
                title={value ?? ""}
                onClick={() => {
                  if (!label) return;

                  const textArea = textAreaRef.current;
                  if (textArea) {
                    const startPos = textArea.selectionStart;
                    const updatedInput = `${input.substring(0, startPos)} ${value} ${input.substring(
                      startPos,
                    )}`;
                    setInput(updatedInput);
                    textArea.focus();
                  }
                }}
                className="my-0 h-8 whitespace-nowrap !py-0 text-xs"
              >
                <BracketsCurly /> &nbsp;
                {label &&
                  capitalizeWord(label.substring(1).replace(/_/gi, " "))}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="relative">
        <PromptForm ref={textAreaRef} />
      </div>
    </div>
  );
}
