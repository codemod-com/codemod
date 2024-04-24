import type { ChangeEvent } from "react";
import { cn } from "~/lib/utils";

type InputProps = {
  defaultValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
} & Omit<JSX.IntrinsicElements["input"], "onChange">;

const UnControlledInput = ({
  className,
  onChange,
  defaultValue,
  placeholder,
}: InputProps) => {
  const classNames = cn(
    "px-4 w-2/6 mb-4 rounded py-2 border text-sm flex justify-end border-gray-bg bg-transparent text-gray-dark active:ring-primary dark:text-gray-lighter dark:border-gray-dark",
    className,
  );

  return (
    <input
      className={classNames}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder={placeholder}
      type="search"
    />
  );
};

export { UnControlledInput };
