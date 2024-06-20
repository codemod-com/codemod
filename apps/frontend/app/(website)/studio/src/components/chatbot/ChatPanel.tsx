import { cn } from "@/utils";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowElbowDownLeft,
  BracketsCurly,
  MagicWand,
  Stop as StopIcon,
} from "@phosphor-icons/react";
import { Button } from "@studio/components/ui/button";
import {
  type Aliases,
  applyAliases,
  useGetAliases,
} from "@studio/store/zustand/CFS/alias";
import { useCodemodExecutionError } from "@studio/store/zustand/log";
import type { UseChatHelpers } from "ai/react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  autoGenerateCodemodPrompt,
  fixCodemodBlockNoDebugInfoPrompt,
} from "../../store/zustand/CFS/prompts";
import { capitalizeWord } from "../../utils/string";
import PromptForm from "./PromptForm";
import ScrollToBottomButton from "./ScrollToBottomButton";

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | "append"
    | "isLoading"
    | "reload"
    | "messages"
    | "stop"
    | "input"
    | "setInput"
    | "setMessages"
  > {
  id?: string;
  setToken: Dispatch<SetStateAction<string | null>>;
}

let usePrompts = (aliases: Aliases) => {
  let codemodExecutionError = useCodemodExecutionError();
  let prompts = [
    ["Build a codemod to transform before to after", autoGenerateCodemodPrompt],
  ];

  let codemodHighlightedValue = aliases.$HIGHLIGHTED_IN_CODEMOD?.value ?? "";

  if (codemodHighlightedValue !== "") {
    prompts.unshift([
      "Regenerate specified code block",
      fixCodemodBlockNoDebugInfoPrompt,
    ]);
  }

  if (codemodExecutionError) {
    prompts.unshift(["Fix codemod error", codemodExecutionError]);
  }

  return prompts;
};

// make sure the most recent highlighted alias goes to the left.
let getOrderedAliasList = (aliases: Aliases) =>
  Object.entries(aliases)
    .filter(([, v]) => v !== null)
    .sort(([, a], [, b]) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0))
    .map(([k, v]) => [k, v?.value ?? ""]);

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  input,
  setInput,
  setMessages,
  messages,
  setToken,
}: ChatPanelProps) {
  let textAreaRef = useRef<HTMLTextAreaElement>(null);
  let [expandedHelper, setExpandedHelper] = useState(true);

  let { getToken, isSignedIn } = useAuth();

  let aliases = useGetAliases();
  let promptsList = usePrompts(aliases);
  let aliasList = getOrderedAliasList(aliases);

  let handleSubmit = async (value: string) => {
    if (isLoading) {
      return;
    }
    let token = await getToken();

    flushSync(() => {
      setToken(token);
    });
    let aliasesAppliedValue = applyAliases(value, aliases);
    await append({
      id,
      content: aliasesAppliedValue,
      role: "user",
    });
  };

  let handleInsertValue = (value: string) => {
    let textArea = textAreaRef.current;

    if (textArea === null) {
      return;
    }

    let startPos = textArea.selectionStart;

    let newValue = `${input.substring(
      0,
      startPos,
    )} ${value} ${input.substring(startPos)}`;

    setInput(newValue);
    let textareaNode =
      document.getElementsByClassName("promptTextarea")?.[0] ?? null;
    if (textareaNode !== null) {
      (textareaNode as HTMLTextAreaElement).focus();
    }
  };

  let hasMessages = messages.length !== 0;

  return (
    (<div className="chatPanel absolute bottom-0 mx-auto w-full sm:pl-8 sm:pr-16">
      {isSignedIn && messages.length > 0 && <ScrollToBottomButton />}
      <div className="flex h-10 items-center justify-center">
        {isLoading && (
          <>
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <StopIcon className="mr-2" />
              Stop generating
            </Button>
          </>
        )}
      </div>
      <div className="relative flex border-t bg-background px-4 pb-2 pt-2 shadow-lg sm:rounded-t-xl sm:border">
        <div className="w-full">
          {expandedHelper ? (
            <>
              <div className="mb-1 flex w-full gap-1 overflow-x-auto px-1">
                {promptsList.map(([label, value]) => (
                  <Button
                    variant={hasMessages ? "outline" : "default"}
                    size="sm"
                    key={label}
                    title={value}
                    onClick={() => value && handleSubmit(value)}
                    className="group my-0 h-8 whitespace-nowrap !py-0 text-xs"
                  >
                    {label}
                    &nbsp;
                    <span className="invisible inline-flex h-7 w-7 items-center justify-center  justify-self-end group-hover:visible">
                      <ArrowElbowDownLeft />
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex w-full gap-1 overflow-x-auto px-1">
                {aliasList.map(([label, value]) => (
                  <Button
                    variant="outline"
                    size="sm"
                    key={label}
                    title={value ?? ""}
                    onClick={() => label && handleInsertValue(label)}
                    className="my-0 h-8 whitespace-nowrap !py-0 text-xs"
                  >
                    <BracketsCurly /> &nbsp;
                    {label &&
                      capitalizeWord(label.substring(1).replace(/_/gi, " "))}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
          <div className="relative">
            <PromptForm
              ref={textAreaRef}
              onSubmit={handleSubmit}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              onReset={() => {
                setMessages([]);
              }}
            />
            <Button
              variant="outline"
              size="icon"
              title={
                expandedHelper
                  ? "Hide recommended prompts & aliases"
                  : "Show recommended prompts & aliases"
              }
              onClick={() => setExpandedHelper(!expandedHelper)}
              className={cn(
                "absolute right-[-65px] top-[10px]",
                expandedHelper && "bg-accent",
              )}
            >
              <MagicWand />
            </Button>
          </div>
        </div>
      </div>
    </div>)
  );
}
