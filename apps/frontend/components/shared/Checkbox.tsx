"use client";

import clsx from "clsx";
import { type InputHTMLAttributes, useState } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
  containerClassName?: string;
};

export default function Checkbox({
  containerClassName,
  className,
  children,
  required,
  checked,
  ...props
}: CheckboxProps) {
  const [_checked, setChecked] = useState(checked);

  return (
    <label
      className={clsx(
        "copy-l lg:copy-s flex cursor-pointer items-center",
        containerClassName,
      )}
    >
      <input
        className={clsx(
          "mr-4 flex h-6 w-6 shrink-0 cursor-pointer appearance-none items-center justify-center rounded border border-border-light border-solid focus:outline-none dark:border-border-dark",
          {
            "border-primary-light bg-primary-light before:mt-1 before:h-6 before:content-check dark:border-primary-dark":
              _checked,
          },
          className,
        )}
        onChange={(e) => setChecked(e.target.checked)}
        required={required}
        type="checkbox"
        {...props}
      />
      {children}
    </label>
  );
}
