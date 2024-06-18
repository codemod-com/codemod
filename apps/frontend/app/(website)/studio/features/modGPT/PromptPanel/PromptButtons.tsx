import { ArrowElbowDownLeft } from "@phosphor-icons/react";
import { Button } from "@studio/components/ui/button";
import * as React from "react";
import type { PropsWithChildren } from "react";

type PromptButtonsProps = {
  promptsList: string[][];
  handleSubmit: (value: string) => void;
};

export const PromptButtons = ({
  promptsList,
  handleSubmit,
  children,
}: PropsWithChildren<PromptButtonsProps>) => (
  <div className="mb-1 flex w-full gap-1 overflow-x-auto px-1 items-center justify-content-center actions">
    {promptsList.map(([label, value]) => (
      <Button
        variant="outline"
        size="sm"
        key={label}
        title={value}
        onClick={() => value && handleSubmit(value)}
        className="group my-0 h-8 whitespace-nowrap !py-0 text-xs"
      >
        {label}
        &nbsp;
        <span className="invisible inline-flex h-7 w-7 items-center justify-center group-hover:visible">
          <ArrowElbowDownLeft />
        </span>
      </Button>
    ))}
    {children}
  </div>
);
