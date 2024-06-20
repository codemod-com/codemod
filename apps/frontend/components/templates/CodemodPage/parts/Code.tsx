"use client";
import Icon from "@/components/shared/Icon";
import { languageToPrismId } from "@/components/shared/pt.blocks/CodeSnippet";
import theme from "@/styles/codeSnippetTheme";
import clsx from "clsx";
import { cx } from "cva";
import { Inconsolata } from "next/font/google";
import { Highlight, Prism } from "prism-react-renderer";
import { useEffect, useState } from "react";

let inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: "400",
  variable: "--inconsolata",
});

let CodeBlock = ({ children }) => {
  let [copied, setCopied] = useState(false);

  let {
    props: { className, children: code = "" },
  } = children;

  let language = className
    ? className
        .replace(/language-/, "")
        ?.trim()
        ?.toLowerCase()
    : "";

  let handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code.trim());
    }

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  let prismLanguageId = languageToPrismId(language);

  useEffect(() => {
    (async () => {
      if (prismLanguageId) {
        window.Prism = Prism;
        await import(`prismjs/components/prism-${prismLanguageId}`);

        if (window.Prism && typeof window.Prism.highlightAll === "function") {
          window.Prism.highlightAll();
        }
      }
    })();
  }, [prismLanguageId]);

  if (!children || children.type !== "code") return null;

  return (
    <div
      className={clsx(
        "codeblock relative mb-10 h-full rounded-md bg-emphasis-light/10 p-4 pr-12 dark:bg-emphasis-dark",
        `${inconsolata.variable} font-mono text-lg`,
      )}
    >
      <div className="absolute right-2 top-2">
        <button
          className={cx(
            "body-s-medium m-xxs flex animate-fade-in items-center gap-xs rounded-[4px] p-3 font-medium transition-all  duration-200",
            "text-tertiary-light lg:hover:bg-emphasis-light/5 dark:border-border-dark dark:text-tertiary-dark dark:lg:hover:bg-primaryHover-light",
          )}
          onClick={handleCopy}
        >
          <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
        </button>
      </div>
      <Highlight theme={theme} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`no-scrollbar my-2 overflow-x-scroll rounded-lg p-[20px]${className}`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
