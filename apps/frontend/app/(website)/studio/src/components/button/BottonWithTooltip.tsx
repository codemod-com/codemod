import Tooltip from "@studio/components/Tooltip/Tooltip";
import { Button } from "@studio/components/ui/button";
import type { ComponentProps, FC, PropsWithChildren, ReactNode } from "react";

type ButtonWithTooltipProps = PropsWithChildren<
  {
    tooltipContent: ReactNode;
  } & ComponentProps<typeof Button>
>;

const ButtonWithTooltip: FC<ButtonWithTooltipProps> = ({
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
