import { useState } from "react";

interface useCopyToClipboardProps {
  timeout?: number;
}

export let useCopyToClipboard = ({
  timeout = 2000,
}: useCopyToClipboardProps) => {
  let [isCopied, setIsCopied] = useState(false);

  let copy = (value: string) => {
    if (
      typeof window === "undefined" ||
      !navigator.clipboard?.writeText ||
      !value
    ) {
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    });
  };

  return { isCopied, copy };
};
