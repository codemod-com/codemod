// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

import { Check as CheckIcon, Copy as CopyIcon } from "@phosphor-icons/react";
import { type FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "~/components/ui/button";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { cn } from "~/lib/utils";
import { useTheme } from "~/pageComponents/main/themeContext";

interface Props {
  language: string;
  value: string;
}

const CodeBlock: FC<Props> = ({ language, value }) => {
  const { isCopied, copy } = useCopyToClipboard({ timeout: 2000 });
  const { isDark } = useTheme();

  const onCopy = () => {
    if (isCopied) {
      return;
    }
    copy(value);
  };

  return (
    <div
      className={cn(
        "codeblock relative mb-3 w-full rounded-lg border bg-background font-sans",
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-lg border-b bg-background px-6 py-2 pr-4",
          {
            "text-zinc-100": isDark,
          },
        )}
      >
        <span className="text-xs lowercase">{language}</span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-md hover:bg-background focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0"
            onClick={onCopy}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? coldarkDark : undefined}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          width: "100%",
          background: "transparent",
          padding: "1.5rem 1rem",
        }}
        codeTagProps={{
          className: "sm:text-xs",
          style: {
            fontFamily: "var(--font-mono)",
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

CodeBlock.displayName = "CodeBlock";

export default memo(CodeBlock);
