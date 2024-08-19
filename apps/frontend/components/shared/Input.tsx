"use client";

import { cx } from "cva";
import React from "react";

import Icon, { type IconName } from "@/components/shared/Icon";

type InputProps = {
  label?: string;
  icon?: IconName;
  command?: string;
  className?: string;
  error?: string;
  isTextArea?: boolean;
  onClear?: () => void;
  inputClassName?: string;
  iconClassName?: string;
  commandClassName?: string;
} & (
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.InputHTMLAttributes<HTMLTextAreaElement>
);

export default function Input({
  label = "",
  icon,
  command,
  className,
  error,
  isTextArea,
  required,
  onClear,
  ...props
}: InputProps) {
  const spreadProps = { ...props };
  delete spreadProps.inputClassName;
  delete spreadProps.iconClassName;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function focusInput() {
    if (inputRef.current) {
      inputRef.current.focus();
    } else if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }
  return (
    <div
      className="flex w-full flex-col gap-xs"
      onClick={() => {
        focusInput();
      }}
    >
      {label?.length ? (
        <label className="body-xs">
          {label}
          {required ? "*" : ""}
        </label>
      ) : null}
      <div
        className={cx(
          "relative flex w-full items-center gap-xs bg-transparent",
          "block cursor-pointer rounded-[8px] border-[1px] border-border-light px-s py-xs text-primary-light transition-colors dark:text-primary-dark",
          !error ? "dark:border-border-dark" : "",
          !error
            ? "hover:border-tertiary-light dark:hover:border-tertiary-dark"
            : "",
          "[&:has(:focus)]:border-tertiary-light dark:[&:has(:focus)]:border-tertiary-dark",
          error ? "border-error-light dark:border-error-dark" : "",
          className,
        )}
      >
        {icon ? (
          <Icon
            name={icon}
            className={cx(
              "min-w-5",
              icon === "loading" && "animate-spin",
              props.iconClassName,
            )}
          />
        ) : null}
        {isTextArea ? (
          <textarea
            ref={textareaRef}
            className={cx(
              "body-s w-full bg-transparent",
              "focus:outline-none",
              props.inputClassName,
            )}
            rows={5}
            placeholder={props.placeholder || "Input"}
            required={required}
            {...(spreadProps as React.InputHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={inputRef}
            className={cx(
              "body-s w-full bg-transparent",
              "focus:outline-none",
              props.inputClassName,
            )}
            placeholder={props.placeholder || "Input"}
            required={required}
            {...(spreadProps as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {command ? (
          <span
            className={cx(
              "body-l absolute right-[5px] top-1/2 hidden shrink-0 -translate-y-1/2 rounded-[4px] bg-emphasis-light px-[6px] tracking-widest text-secondary-light lg:flex dark:bg-emphasis-dark dark:text-secondary-dark",
              props.commandClassName,
            )}
          >
            {command}
          </span>
        ) : null}
        {!!onClear && props.value ? (
          <button
            onClick={onClear}
            className="body-l absolute right-[5px] top-1/2 flex shrink-0 -translate-y-1/2 rounded-[4px]  px-[6px] tracking-widest text-secondary-light  dark:text-secondary-dark"
          >
            <Icon name={"close"} className={cx("my-1  ")} />
          </button>
        ) : null}
      </div>
      {error ? <span className="body-xs text-error-light">{error}</span> : null}
    </div>
  );
}
