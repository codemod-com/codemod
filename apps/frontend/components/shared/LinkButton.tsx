import { cx } from "cva";
import type React from "react";
import {
  type Button,
  type ButtonWithArrow,
  type ButtonWithIconOnly,
  buttonVariant,
} from "./Button";
import Icon, { type IconName } from "./Icon";
import { SanityLink } from "./SanityLink";
import Spinner from "./Spinner";

export type LinkButtonProps = (Button | ButtonWithArrow | ButtonWithIconOnly) &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    scroll?: boolean;
  };

export default function LinkButton({
  intent = "primary",
  className,
  arrow,
  icon,
  iconPosition,
  loading = false,
  children,
  ...props
}: LinkButtonProps) {
  const disabledIconState = cx(
    loading ? "invisible opacity-0 transition-opacity" : "transition-opacity",
  );
  const isDisabled = props?.["data-disabled"] === 1;

  return (
    <SanityLink
      link={{ href: props.href, _type: "link" }}
      className={cx(buttonVariant({ intent }), className, {
        ["gap-xxs"]: arrow,
        ["pointer-events-none"]: loading,
        ["cursor-not-allowed opacity-30"]: isDisabled,
      })}
      {...props}
    >
      {icon && iconPosition && iconPosition === "left" ? (
        <Icon name={icon as IconName} className={disabledIconState} />
      ) : null}
      <span className={cx(loading ? "invisible" : "transition-opacity")}>
        {children}
      </span>
      {loading ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner />
        </span>
      ) : null}
      {icon && iconPosition && iconPosition == "right" ? (
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
    </SanityLink>
  );
}
