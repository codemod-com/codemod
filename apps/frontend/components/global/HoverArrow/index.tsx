import { cva, cx } from "class-variance-authority";
import type React from "react";

export const hoverArrowStyles = cva(
  [
    "inline-block",
    "relative top-0",
    "w-2.5 h-2.5",
    "fill-none stroke-current",
    "transition-transform duration-150 ease-in-out",
  ],
  {
    variants: {
      size: {
        default: ["ml-2", "stroke-2"], // 0.5rem margin-left and 2px stroke
        small: ["mr-1", "stroke-[1.5]"], // 4px margin-right and 1.5px stroke
      },
      // You can add more variants if needed
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface HoverArrowProps {
  size?: "small" | "default";
  className?: string;
}

const HoverArrow: React.FC<HoverArrowProps> = ({
  size = "small",
  className,
}) => {
  return (
    <svg
      className={cx(hoverArrowStyles({ size }), className)}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <g fillRule="evenodd">
        <path
          className="opacity-0 transition-opacity duration-150 ease-in-out"
          d="M0 5h7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          className="transition-transform duration-150 ease-in-out translate-x-offset"
          d="M1 1l4 4-4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default HoverArrow;
