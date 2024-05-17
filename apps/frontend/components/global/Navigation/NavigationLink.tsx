import Icon from "@/components/shared/Icon";
import { SanityLink } from "@/components/shared/SanityLink";
import { isExternalUrl } from "@/utils/urls";
import { vercelStegaSplit } from "@vercel/stega";
import { cx } from "cva";

type NavigationLinkProps = {
  children: React.ReactNode;
  inline?: boolean;
  href: string;
  asButton?: boolean;
  textStyle?: "default" | "medium" | "large" | "inline";
  hideExternalIcon?: boolean;
  isCurrent?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type NavigationLinkAsButtonProps = {
  children: React.ReactNode;
  href?: string;
  asButton?: boolean;
  type?: "submit" | "reset" | "button";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function NavigationLink(
  props: NavigationLinkProps | NavigationLinkAsButtonProps,
) {
  function isButton(
    props: NavigationLinkProps | NavigationLinkAsButtonProps,
  ): props is NavigationLinkAsButtonProps {
    return (props as NavigationLinkAsButtonProps).asButton === true;
  }

  if (isButton(props)) {
    let { children, ...buttonProps } = props;
    delete buttonProps.asButton;

    return (
      <button
        className="body-s-medium cursor-pointer rounded-[8px] px-s py-xs font-medium transition-colors hover:bg-emphasis-light dark:hover:bg-emphasis-dark"
        {...buttonProps}
      >
        {children}
      </button>
    );
  }
  let { href, children, hideExternalIcon, inline, ...linkProps } = props;
  let { cleaned } = vercelStegaSplit(props?.href || "");
  let isExternal = hideExternalIcon ? false : isExternalUrl(cleaned);
  let spreadProps = { ...props };
  delete props.asButton;
  delete spreadProps.textStyle;
  delete spreadProps.hideExternalIcon;
  delete spreadProps.isCurrent;
  delete spreadProps.inline;

  return (
    <SanityLink
      link={{ href: cleaned || "" }}
      {...spreadProps}
      className={cx(
        props.className,
        "group inline-flex cursor-pointer items-center gap-xxs ",
        props.isCurrent ? "font-bold" : "font-medium",
        inline
          ? null
          : {
              "body-s-medium":
                !props.textStyle || props.textStyle === "default",
              "body-m-medium": props.textStyle === "medium",
              "body-l-medium": props.textStyle === "large",
            },
      )}
    >
      {children}
      {isExternal ? (
        <Icon
          name="arrow-up-right"
          className="h-4 w-4 transition-transform ease-out group-hover:-translate-y-[2px] group-hover:translate-x-[2px]"
        />
      ) : null}
    </SanityLink>
  );
}
