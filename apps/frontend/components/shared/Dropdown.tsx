"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cx } from "cva";
import React from "react";
import Icon from "./Icon";

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  options: Option[];
  error?: string;
  // selected?: Option;
  // setSelected?: (option: Option) => void;
};

export default function Dropdown({ label, options, error }: SelectProps) {
  // Temporary state to manage the selected option - lift this to parent component
  const [selected, setSelected] = React.useState<Option | null>(null);

  return (
    <DropdownMenu.Root>
      <div className="flex w-full max-w-[260px] flex-col gap-xs">
        <label className="body-xs">{label}</label>
        <DropdownMenu.Trigger
          id="dropdown"
          className={cx(
            "group/trigger flex w-full max-w-[260px] items-center justify-between gap-xs",
            "block cursor-pointer rounded-[8px] border-[1px] border-border-light bg-primary-dark px-s py-xs transition-colors focus:outline-none",
            "dark:bg-primary-light dark:text-primary-dark",
            !error ? "dark:border-border-dark" : "",
            !error
              ? "hover:border-tertiary-light dark:hover:border-tertiary-dark"
              : "",
            !error
              ? "focus-visible:border-tertiary-light dark:focus-visible:border-tertiary-dark"
              : "",
            error ? "border-error-light dark:border-error-dark" : "",
          )}
        >
          {selected ? selected.label : "Select an option"}
          <Icon
            name="chevron-down"
            className="transition-transform group-data-[state=open]/trigger:-rotate-180"
          />
        </DropdownMenu.Trigger>
        {error ? (
          <span className="body-xs text-error-light">{error}</span>
        ) : null}
      </div>
      <div className="w-full max-w-[260px]">
        <DropdownMenu.Content
          className={cx(
            "w-full min-w-[260px] cursor-pointer rounded-[8px] border-[1px] border-border-light py-xxs transition-colors will-change-[opacity,transform] data-[side=bottom]:animate-slideDownAndFade ",
            "body-s-medium bg-primary-dark text-primary-light",
            "dark:border-border-dark dark:bg-primary-light dark:text-primary-dark",
          )}
          sideOffset={4}
          side="bottom"
        >
          {options?.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              className={cx(
                "px-s py-xs focus:outline-none",
                "hover:bg-emphasis-light dark:hover:bg-emphasis-dark",
                "focus-visible:bg-emphasis-light dark:focus-visible:bg-emphasis-dark",
              )}
              onSelect={() => setSelected(option)}
            >
              {option.label}
              <DropdownMenu.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                <Icon name="check" />
              </DropdownMenu.ItemIndicator>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </div>
    </DropdownMenu.Root>
  );
}
