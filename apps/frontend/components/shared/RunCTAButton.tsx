"use client";

import type { ReactNode } from "react";
import { type ExternalToast, toast } from "sonner";
import Button from "./Button";

type RunCTAButtonProps = {
  href: string;
  title: string;
  toastMessage?: ReactNode;
  toastOptions?: ExternalToast;
};

export default function RunCTAButton({
  href,
  title,
  toastMessage,
  toastOptions,
}: RunCTAButtonProps) {
  return (
    <Button
      iconPosition="left"
      icon="noborder-vscode"
      intent="secondary"
      onClick={() => {
        if (toastMessage) {
          toast(toastMessage, toastOptions);
        }
      }}
    >
      <a href={href}>{title}</a>
    </Button>
  );
}
