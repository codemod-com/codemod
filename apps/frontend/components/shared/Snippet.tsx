"use client";

import { cx } from "cva";
import React, { useState } from "react";
import { toast } from "sonner";
import Icon from "./Icon";

type SnippetProps = {
  command: string;
  variant?: "primary" | "secondary";
  onCopy?: () => void;
  toastText?: string;
};

export default function Snippet({
  command,
  variant = "primary",
  onCopy,
  toastText = "Copied command to clipboard",
}: SnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(command);
    }

    setCopied(true);
    onCopy?.();
    setTimeout(() => {
      setCopied(false);
    }, 1200);
    toast(toastText);
  };

  return (
    <div
      className={cx("flex items-center justify-between gap-xs rounded-[8px] ", {
        "w-full bg-emphasis-light text-primary-light dark:bg-emphasis-dark dark:text-primary-dark":
          variant === "secondary",
        "min-w-[280px] max-w-44 border-[1px] border-border-light text-secondary-light dark:border-border-dark":
          variant === "primary",
      })}
    >
      <span
        className={cx(
          "code truncate whitespace-nowrap py-xs pl-s  transition-[width]  dark:text-secondary-dark",
          {
            "text-[14px] lg:text-[16px]": variant === "primary",
            "!text-[14px]": variant === "secondary",
          },
        )}
      >
        {variant === "secondary" && "> "} {command}
      </span>
      {!copied ? (
        <button
          className={cx(
            "body-s-medium  m-xxs flex animate-fade-in items-center gap-xs rounded-[4px] duration-200",
            " px-[12px] py-xxs font-medium  transition-all",
            {
              "bg-gradient-to-br from-accent to-[#EEFDC2] text-primary-light hover:to-accent ":
                variant === "primary",
            },
          )}
          onClick={handleCopy}
        >
          {variant === "primary" && <span>Try</span>}
          <Icon name="copy" className="h-4 w-4" />
        </button>
      ) : (
        <button
          className={cx(
            "awSDASD body-s-medium m-xxs flex animate-fade-in items-center gap-xs rounded-[4px] px-[12px] py-xxs",
            "font-medium transition-all duration-200 ",
            {
              "bg-emphasis-light text-primary-light dark:bg-emphasis-dark dark:text-primary-dark":
                variant === "primary",
            },
          )}
        >
          {variant === "primary" && <span>Copied</span>}
          <Icon name="check" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
