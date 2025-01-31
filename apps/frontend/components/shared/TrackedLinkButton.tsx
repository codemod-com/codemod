"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import type React from "react";
import { useCallback } from "react";
import LinkButton from "./LinkButton";

const TAG_ID = process.env.NEXT_PUBLIC_GTM_TAG_ID;
const CONVERSION_LABEL = "JsQNCIveqZYaELvihfYq";

const TrackedLinkButton: React.FC<{
  href?: string;
  children?: React.ReactNode;
}> = ({ href, children }) => {
  const handleMouseDown = useCallback(() => {
    console.log("Tracking conversion for:", href);

    sendGTMEvent({
      event: "conversion",
      send_to: `${TAG_ID}/${CONVERSION_LABEL}`,
      value: 1.0,
      currency: "USD",
    });
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

export default TrackedLinkButton;
