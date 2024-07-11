import { ArrowElbowDownLeft } from "@phosphor-icons/react";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import ButtonWithTooltip from "@studio/components/button/BottonWithTooltip";
import { Button } from "@studio/components/ui/button";
import Link from "next/link";
import * as React from "react";

export const ClearHistoryButton = ({ onClick }: { onClick: VoidFunction }) => (
  <ButtonWithTooltip
    tooltipContent={<>Clear all messages in assistant</>}
    variant="outline"
    size="sm"
    className="group my-0 h-8 whitespace-nowrap !py-0 text-xs [&>*]:mr-1"
    onClick={onClick}
  >
    <TrashIcon />
    Clear history
  </ButtonWithTooltip>
);
