import { cva, cx } from "cva";
import type React from "react";
import { forwardRef } from "react";
import Icon, { type IconName } from "./Icon";
import Spinner from "./Spinner";

export type ButtonStyle =
  | "primary"
  | "secondary"
  | "primary-icon-only"
  | "secondary-icon-only"
  | "inline";

export type Button = {
  intent: ButtonStyle;
  className?: string;
  arrow?: never;
  icon?: IconName | React.ReactElement;
  iconPosition?: "left" | "right";
  loading?: boolean;
  glow?: boolean;
  flush?: boolean;
};

export type ButtonWithArrow = {
  intent: ButtonStyle;
  className?: string;
  arrow?: boolean;
  icon?: never;
  iconPosition?: never;
  loading?: boolean;
  glow?: boolean;
  flush?: boolean;
};

export type ButtonWithIconOnly = {
  intent: ButtonStyle;
  className?: string;
  arrow?: never;
  icon: IconName;
  iconPosition?: never;
  loading?: boolean;
  glow?: boolean;
  flush?: boolean;
};

type ButtonProps = (Button | ButtonWithArrow | ButtonWithIconOnly) &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export let buttonVariant = cva(
  [
    "relative flex py-xs rounded-[8px] font-medium transition-colors group disabled:text-tertiary-light disabled:bg-emphasis-light dark:disabled:text-tertiary-dark dark:disabled:bg-emphasis-dark focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark justify-center items-center",
  ],
  {
    variants: {
      intent: {
        primary: [
          "bg-primary-light body-s-medium text-primary-dark border-[1px] border-transparent",
          "dark:bg-primary-dark dark:text-primary-light",
          "lg:hover:bg-primaryHover-light dark:lg:hover:bg-primaryHover-dark dark:border-border-dark",
          "gap-xs",
          "px-s",
        ],
        secondary: [
          "bg-primary-dark body-s-medium text-primary-light border-[1px] border-border-light",
          "dark:bg-primary-light dark:text-primary-dark dark:border-border-dark",
          "lg:hover:bg-emphasis-light dark:lg:hover:bg-emphasis-dark dark:lg:hover:text-primary-dark",
          "gap-xs",
          "px-s",
        ],
        "primary-icon-only": [
          "bg-primary-light body-s-medium text-primary-dark border-[1px] border-transparent",
          "dark:bg-primary-dark dark:text-primary-light",
          "lg:hover:bg-primaryHover-light dark:lg:hover:bg-primaryHover-dark dark:border-border-dark",
          "px-xs",
        ],
        "secondary-icon-only": [
          "bg-primary-dark body-s-medium text-primary-light border-[1px] border-border-light",
          "dark:bg-primary-light dark:text-primary-dark dark:border-border-dark",
          "lg:hover:bg-emphasis-light dark:lg:hover:bg-emphasis-dark",
          "px-xs",
        ],
        inline: [
          "body-s-medium text-primary-light",
          "dark:text-primary-dark",
          "lg:hover:bg-emphasis-light dark:lg:hover:bg-emphasis-dark",
          "px-s",
        ],
      },
      flush: {
        true: ["!px-[0px]"],
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  },
);

let Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      intent = "primary",
      className,
      arrow,
      icon,
      iconPosition,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
    let spreadableProps = { ...props };
    delete spreadableProps.glow;
    delete spreadableProps.flush;

    let disabledIconState = cx(
      props.disabled && "pointer-events-none opacity-30",
      loading ? "invisible opacity-0 transition-opacity" : "transition-opacity",
    );
    return (
      <button
        ref={ref}
        className={cx(
          buttonVariant({ intent, flush: props?.flush }),
          className,
          {
            "gap-xxs": arrow,
            "pointer-events-none": loading,
          },
        )}
        {...spreadableProps}
      >
        {typeof icon === "object" && icon}
        {typeof icon === "string" && iconPosition && iconPosition === "left" ? (
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
        {typeof icon === "string" &&
        iconPosition &&
        iconPosition === "right" ? (
          <Icon name={icon as IconName} className={disabledIconState} />
        ) : null}
        {typeof icon === "string" && !iconPosition ? (
          <Icon name={icon as IconName} className={disabledIconState} />
        ) : null}
        {arrow ? (
          <Icon
            name={"chevron-right"}
            className={cx(
              props?.disabled
                ? "pointer-events-none opacity-30"
                : "transition-transform duration-1000 group-hover:translate-x-xxs",
            )}
          />
        ) : null}
        {props.glow && <GlowSVG />}
        {props.glow && <GlowBorderBottom />}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;

export function GlowSVG() {
  return (
    <svg
      width="84"
      height="20"
      viewBox="0 0 84 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hidden dark:absolute dark:bottom-0 dark:left-1/2 dark:z-10 dark:flex dark:-translate-x-1/2"
    >
      <g opacity="0.6" filter="url(#filter0_f_1318_7466)">
        <ellipse
          cx="33.5"
          cy="10"
          rx="33.5"
          ry="10"
          transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 75 20)"
          fill="url(#paint0_linear_1318_7466)"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_1318_7466"
          x="-12"
          y="0"
          width="107"
          height="60"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="10"
            result="effect1_foregroundBlur_1318_7466"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1318_7466"
          x1="33.5"
          y1="0"
          x2="33.5"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GlowBorderBottom() {
  return (
    <div className="hidden dark:absolute dark:bottom-[-1px] dark:left-1 dark:right-1 dark:z-[1] dark:flex dark:h-[1px] dark:max-w-full dark:bg-gradient-to-r dark:from-transparent dark:via-white dark:to-transparent" />
  );
}
