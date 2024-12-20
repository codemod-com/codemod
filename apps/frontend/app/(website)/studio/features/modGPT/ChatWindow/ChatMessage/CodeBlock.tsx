import { useTranslation } from "react-i18next";
// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

import { cn } from "@/utils";
import { useTheme } from "@context/useTheme";
import {
  ArrowArcRight as ArrowArcRightIcon,
  Check as CheckIcon,
  Copy as CopyIcon,
} from "@phosphor-icons/react";
import ButtonWithTooltip from "@studio/components/button/BottonWithTooltip";
import { useCopyToClipboard } from "@studio/hooks/useCopyToClipboard";
import { useModStore } from "@studio/store/mod";
import { prettify } from "@studio/utils/prettify";
import { type FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Props {
  language: string;
  value: string;
}

const CodeBlock: FC<Props> = ({ language, value }) => {
const { t } = useTranslation("(website)/studio/features/modGPT/ChatWindow/ChatMessage");

  const { isCopied, copy } = useCopyToClipboard({ timeout: 2000 });
  const { setContent } = useModStore();
  const { isDark } = useTheme();

  const handleCopyToClipboard = () => {
    if (!isCopied) {
      copy(value);
    }
  };

  const buttonClass =
    "text-md text-primary-light dark:text-primary-dark hover:bg-background focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0";

  const handleCopyToCodemodPanel = () => {
    setContent(prettify(value));
  };

  const copyToCodemodPanelBtn = (
    <ButtonWithTooltip
      tooltipContent={<>{t('copy-to-codemod-panel-1')}</>}
      variant="ghost"
      size="icon"
      className={buttonClass}
      onClick={handleCopyToCodemodPanel}
    >
      <ArrowArcRightIcon />
      <span className="sr-only">{t('copy-to-codemod-panel-2')}</span>
    </ButtonWithTooltip>
  );

  const copyToClipboardBtn = (
    <ButtonWithTooltip
      tooltipContent={<>{t('copy-to-clipboard-1')}</>}
      variant="ghost"
      size="icon"
      className={buttonClass}
      onClick={handleCopyToClipboard}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only">{t('copy-to-clipboard-2')}</span>
    </ButtonWithTooltip>
  );
  return (
    <div
      className={cn(
        "codeblock relative mb-3 w-full rounded-lg border bg-background font-sans",
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-lg border-b bg-background px-6 py-2 pr-4",
          { "text-zinc-100": isDark },
        )}
      >
        <span className="text-xs text-primary-light dark:text-primary-dark lowercase">
          {language}
        </span>
        <div className="flex items-center space-x-1">
          {copyToClipboardBtn}
          {copyToCodemodPanelBtn}
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
          style: { fontFamily: "var(--font-mono)" },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

CodeBlock.displayName = "CodeBlock";

export default memo(CodeBlock);
