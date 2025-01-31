"use client";

import type React from "react";
import { useCallback } from "react";
import LinkButton from "./LinkButton";

interface AnalyticsLinkButtonProps {
  href?: string;
  children?: React.ReactNode;
}

const AnalyticsLinkButton = ({ href, children }: AnalyticsLinkButtonProps) => {
  const handleMouseDown = useCallback(() => {
    if (typeof window !== "undefined" && "gtag_report_conversion" in window) {
      // @ts-ignore
      gtag_report_conversion(href);
    }
  }, [href]);

  return (
    <LinkButton
      href={href}
      onMouseDown={handleMouseDown}
      intent="primary"
      arrow
      hideExternalIcon
    >
      {children}
    </LinkButton>
  );
};

export default AnalyticsLinkButton;
