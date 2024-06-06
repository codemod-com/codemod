import { cn } from "@/utils";
import { type ReactNode, createElement } from "react";

type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
type Heading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
type FontWeight =
  | "bold"
  | "semibold"
  | "bolder"
  | "normal"
  | "lighter"
  | "light";
type TextProps = {
  children: ReactNode;
  heading?: Heading;
  size?: TextSize;
  fontWeight?: FontWeight;
  className?: string;
  color?: string;
  isTitle?: boolean;
} & JSX.IntrinsicElements["p"];

const Text = ({
  children,
  className,
  size,
  fontWeight,
  color,
  heading,
  isTitle,
  ...rest
}: TextProps) => {
  const classes = cn(
    size === "xs" && "text-xs",
    size === "sm" && "text-sm",
    size === "base" || (!size && "text-base"),
    size === "lg" && "text-lg",
    size === "xl" && "text-xl",
    size === "2xl" && "text-2xl",
    size === "3xl" && "text-3xl",
    size === "4xl" && "text-4xl",
    fontWeight === "bold" && "font-bold",
    fontWeight === "semibold" && "font-semibold",
    fontWeight === "bolder" && "font-extrabold",
    fontWeight === "normal" && "font-normal",
    fontWeight === "lighter" && "font-thin",
    fontWeight === "light" && "text-light",
    !color && isTitle && "text-gray-text-title dark:text-gray-text-dark-title",
    !color &&
      !isTitle &&
      "text-gray-text-normal dark:text-gray-text-dark-normal",
    color,
    className,
  );

  if (heading) {
    return createElement(heading, { ...rest, className: classes }, children);
  }

  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  );
};

export default Text;
