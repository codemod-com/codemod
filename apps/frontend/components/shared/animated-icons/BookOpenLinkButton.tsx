"use client";
import { vercelStegaSplit } from "@vercel/stega";
import { cx } from "cva";
import type React from "react";
import { useState } from "react";
import {
  type Button,
  type ButtonWithArrow,
  type ButtonWithIconOnly,
  buttonVariant,
} from "../Button";
import { SanityLink } from "../SanityLink";
import BookOpen from "./BookOpen";

export type LinkButtonProps = (Button | ButtonWithArrow | ButtonWithIconOnly) &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    scroll?: boolean;
    hideExternalIcon?: boolean;
  };

export default function BookOpenLinkButton({
  intent = "primary",
  className,
  loading = false,
  children,
  hideExternalIcon,
  ...props
}: LinkButtonProps) {
  let { cleaned } = vercelStegaSplit(props?.href || "");

  let disabledIconState = cx(
    loading ? "invisible opacity-0 transition-opacity" : "transition-opacity",
  );
  let isDisabled = props?.["data-disabled"] === 1;
  let [play, setPlay] = useState(false);
  return (
    <div onMouseEnter={() => setPlay(true)} onMouseLeave={() => setPlay(false)}>
      <SanityLink
        link={{ href: cleaned, _type: "link" }}
        className={cx(buttonVariant({ intent }), className, {
          "pointer-events-none": loading,
          "cursor-not-allowed opacity-30": isDisabled,
        })}
        {...props}
      >
        <BookOpen play={play} className="h-5 w-5" />

        <span className={cx(loading ? "invisible" : "transition-opacity")}>
          {children}
        </span>
      </SanityLink>
    </div>
  );
}
