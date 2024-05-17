import { cva, cx } from "cva";
import type React from "react";

type TagStyle = "primary" | "default" | "static";

type TagProps = {
  intent?: TagStyle;
  children: React.ReactNode;
  iconOnly?: boolean;
};

let tagVariant = cva(
  [
    "rounded-[4px] px-xs py-xxs font-medium border-[1px] flex items-center gap-xxs transition-colors",
  ],
  {
    variants: {
      intent: {
        default: [
          "cursor-pointer",
          "text-primary-light bg-primary-dark",
          "dark:bg-primary-light dark:text-primary-dark",
          "border-border-light dark:border-border-dark",
          "hover:bg-emphasis-light dark:hover:bg-emphasis-dark",
          "body-s-medium",
        ],
        static: [
          "cursor-default",
          "text-primary-light bg-primary-dark",
          "dark:bg-primary-light dark:text-primary-dark",
          "border-border-light dark:border-border-dark",
          "body-s-medium",
        ],
        primary: [
          "cursor-pointer",
          "text-primary-light bg-gradient-to-br from-accent to-[#EEFDC2]",
          "border border-transparent",
          "body-s-medium",
        ],
      },
      iconOnly: {
        true: ["px-xxs"],
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

export default function Tag({ intent, iconOnly, children }: TagProps) {
  return (
    <div
      className={cx(
        tagVariant({
          intent,
          iconOnly,
        }),
      )}
    >
      {children}
    </div>
  );
}
