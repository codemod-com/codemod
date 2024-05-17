import { isExternalUrl } from "@/utils/urls";
import { vercelStegaSplit } from "@vercel/stega";
import { cx } from "cva";
import type React from "react";
import {
  type Button,
  type ButtonWithArrow,
  type ButtonWithIconOnly,
  GlowBorderBottom,
  GlowSVG,
  buttonVariant,
} from "./Button";
import Icon, { type IconName } from "./Icon";
import { SanityLink } from "./SanityLink";
import Spinner from "./Spinner";

export type LinkButtonProps = (Button | ButtonWithArrow | ButtonWithIconOnly) &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    scroll?: boolean;
    hideExternalIcon?: boolean;
  };

export default function LinkButton({
  intent = "primary",
  className,
  arrow,
  icon,
  iconPosition,
  loading = false,
  children,
  hideExternalIcon,
  ...props
}: LinkButtonProps) {
  let { cleaned } = vercelStegaSplit(props?.href || "");

  let isExternal = hideExternalIcon ? false : isExternalUrl(cleaned);

  let disabledIconState = cx(
    loading ? "invisible opacity-0 transition-opacity" : "transition-opacity",
  );
  let isDisabled = props?.["data-disabled"] === 1;

  return (
    <SanityLink
      link={{ href: props.href, _type: "link" }}
      className={cx(buttonVariant({ intent }), className, {
        "gap-xxs": arrow,
        "pointer-events-none": loading,
        "cursor-not-allowed opacity-30": isDisabled,
      })}
      {...props}
    >
      {icon && iconPosition && iconPosition === "left" ? (
        <Icon name={icon as IconName} className={disabledIconState} />
      ) : null}
      <span className={cx(loading ? "invisible" : "transition-opacity")}>
        {children}
      </span>
      {isExternal ? (
        <Icon
          name="arrow-up-right"
          className="h-4 w-4 transition-transform ease-out group-hover:-translate-y-[2px] group-hover:translate-x-[2px]"
        />
      ) : null}
      {loading ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner />
        </span>
      ) : null}
      {icon && iconPosition && iconPosition === "right" ? (
        <Icon name={icon as IconName} className={disabledIconState} />
      ) : null}
      {icon && !iconPosition ? (
        <Icon name={icon as IconName} className={disabledIconState} />
      ) : null}
      {arrow ? (
        <Icon
          name="chevron-right"
          className={cx(
            "transition-transform duration-150 group-hover:translate-x-[4px]",
          )}
        />
      ) : null}
      {props.glow && <GlowSVG />}
      {props.glow && <GlowBorderBottom />}
    </SanityLink>
  );
}
