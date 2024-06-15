"use client";
import Icon from "@/components/shared/Icon";
import { languageToPrismId } from "@/components/shared/pt.blocks/CodeSnippet";
import theme from "@/styles/codeSnippetTheme";
import clsx from "clsx";
import { cx } from "cva";
import { Inconsolata } from "next/font/google";
import { Highlight, Prism } from "prism-react-renderer";
import { isValidElement, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode[];
  scrollable: boolean;
};

let inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: "400",
  variable: "--inconsolata",
});

let getCodeProps = (
  children: React.ReactNode[],
): { language: string; code: string } | null => {
  let firstChild = children.at(0);

  if (!isValidElement(firstChild)) {
    return null;
  }

  let { lang, children: _children } = firstChild.props;

  let language = lang
    ? lang
        .replace(/language-/, "")
        ?.trim()
        ?.toLowerCase()
    : "";

  let code = _children.at(0);

  return { language, code };
};

let CodeBlock = ({ children, scrollable = true }: Props) => {
  let [copied, setCopied] = useState(false);

  let props = getCodeProps(children);

  let handleCopy = () => {
    if (!props?.code) {
      return;
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(props.code.trim());
    }

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  let prismLanguageId = props?.language
    ? languageToPrismId(props.language)
    : null;

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

  if (props === null) {
    return null;
  }

  return (
    <div
      className={clsx(
        "codeblock relative mb-10 h-full rounded-[8px] bg-emphasis-light/5 p-4 pr-12 dark:bg-emphasis-dark/10",
        `${inconsolata.variable} font-mono text-lg`,
        {
          "overflow-hidden": scrollable,
        },
      )}
    >
      <div className="absolute right-2 top-2">
        <button
          type="button"
          className={cx(
            "body-s-medium m-xxs flex animate-fade-in items-center gap-xs rounded-[4px] p-3 font-medium transition-all  duration-200",
            "text-tertiary-light lg:hover:bg-emphasis-light/5 dark:border-border-dark dark:text-tertiary-dark dark:lg:hover:bg-primaryHover-light",
          )}
          onClick={handleCopy}
        >
          <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
        </button>
      </div>
      <Highlight
        theme={theme}
        code={props.code.trim()}
        language={props.language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={clsx(
              `my-2 rounded-lg p-[20px] overflow-y-hidden ${className}`,
              {
                // biome-ignore lint/complexity/useLiteralKeys:
                ["no-scrollbar overflow-x-scroll"]: scrollable,
              },
            )}
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
