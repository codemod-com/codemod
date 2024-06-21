import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@studio/components/ui/tooltip";
import type { ReactNode } from "react";

type Props = {
  trigger: ReactNode;
  content: string | ReactNode;
  className?: string
};

const Tooltip = ({ trigger, content, className }: Props) => (
  <TooltipProvider>
    <ShadcnTooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className={className}>{content}</TooltipContent>
    </ShadcnTooltip>
  </TooltipProvider>
);

export default Tooltip;
