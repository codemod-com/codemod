import { cn } from "@/utils";
import {
  ArrowElbowDownLeft as ArrowElbowDownLeftIcon,
  Trash as TrashIcon,
} from "@phosphor-icons/react";
import Tooltip from "@studio/components/Tooltip/Tooltip";
import { Button, buttonVariants } from "@studio/components/ui/button";
import { useEnterSubmit } from "@studio/hooks/useEnterSubmit";
import type { UseChatHelpers } from "ai/react";
import * as React from "react";
import Textarea from "react-textarea-autosize";

export interface Props extends Pick<UseChatHelpers, "input" | "setInput"> {
  onSubmit: (value: string) => Promise<void>;
  onReset: () => void;
  isLoading: boolean;
}

export let PromptForm = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ onSubmit, onReset, input, setInput, isLoading }, ref) => {
    let { formRef, onKeyDown } = useEnterSubmit();
    let inputRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    return (
      <form
        className="!mt-1"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!input?.trim()) {
            return;
          }
          setInput("");
          await onSubmit(input);
        }}
        ref={formRef}
      >
        <div className="max-h-60 relative flex w-full grow items-center overflow-hidden bg-background pl-8 sm:rounded-md sm:border sm:pl-12">
          <Tooltip
            trigger={
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onReset();
                }}
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant: "outline",
                  }),
                  "absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4",
                )}
              >
                <TrashIcon />
                <span className="sr-only">Clear History</span>
              </button>
            }
            content="Clear History"
          />

          <Textarea
            maxRows={5}
            ref={ref ?? inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message."
            spellCheck={false}
            className="promptTextarea min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-xs"
          />
          <div className="absolute right-0 top-3 sm:right-4">
            <Tooltip
              trigger={
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || input === ""}
                  variant="outline"
                >
                  <ArrowElbowDownLeftIcon />
                  <span className="sr-only">Send message</span>
                </Button>
              }
              content="Send message"
            />
          </div>
        </div>
      </form>
    );
  },
);

PromptForm.displayName = "PromptForm";
