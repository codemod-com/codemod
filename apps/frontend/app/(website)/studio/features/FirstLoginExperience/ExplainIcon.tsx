import { cn } from "@/utils";
import type { Lightbulb } from "@phosphor-icons/react";
import Tooltip from "@studio/components/Tooltip/Tooltip";
import * as React from "react";
export let ExplainIcon = ({
  text,
  Icon,
  onClick,
  className,
}: {
  text: string;
  Icon: typeof Lightbulb;
  className?: string;
  onClick?: VoidFunction;
}) => {
  return (
    <Tooltip
      trigger={
        <button
          onClick={onClick}
          className={cn(
            className,
            "cursor-pointer border-hidden align-text-top bg-transparent hover:bg-transparent",
          )}
        >
          <Icon />
        </button>
      }
      content={<p>{text}</p>}
    />
  );
};
