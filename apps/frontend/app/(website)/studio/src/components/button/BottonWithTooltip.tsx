import Tooltip from "@studio/components/Tooltip/Tooltip";
import { Button } from "@studio/components/ui/button";
import type React from "react";
import type { PropsWithChildren } from "react";
import ReactMarkdown from "react-markdown";
import children = ReactMarkdown.propTypes.children;

type ButtonWithTooltipProps = PropsWithChildren<
  {
    tooltipContent: React.ReactNode;
  } & React.ComponentProps<typeof Button>
>;

const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({
  children,
  tooltipContent,
  ...buttonProps
}) => {
  return (
    <Tooltip
      trigger={<Button {...buttonProps}>{children}</Button>}
      content={tooltipContent}
    />
  );
};

export default ButtonWithTooltip;
