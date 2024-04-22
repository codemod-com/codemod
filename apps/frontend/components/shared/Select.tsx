"use client";

import clsx from "clsx";
import { cx } from "cva";
import type React from "react";
import {
	type ForwardedRef,
	type SelectHTMLAttributes,
	forwardRef,
	useState,
} from "react";
import Icon from "./Icon";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
	options: Array<{ value: string; label: string }>;
	containerClassName?: string;
};

export default forwardRef(function Select(
	{
		containerClassName,
		className,
		options,
		value: _value,
		onChange: _onChange,
		...props
	}: SelectProps,
	ref: ForwardedRef<HTMLSelectElement>,
) {
	const [value, setValue] = useState(_value);

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setValue(e.target.value);
		if (_onChange) {
			_onChange(e);
		}
	};

	return (
		<div
			className={clsx(
				"relative inline-block w-full lg:w-[16rem]",
				containerClassName,
			)}
		>
			<select
				className={clsx(
					"placeholder:text-input body mr-6 block w-full cursor-pointer appearance-none bg-background-light py-3 text-left focus:outline-none",
					{ "text-primary-light": !!value, "text-placeholder": !value },
					className,
				)}
				ref={ref}
				onChange={onChange}
				{...props}
			>
				{options.map((option, index) => (
					<option
						key={`${option.value}-${index}`}
						value={option.value}
						className={clsx(option.value ? "text-primary-light" : "text-input")}
					>
						{option.label}
					</option>
				))}
			</select>
			<Icon
				name="chevron-down"
				className={cx(
					"pointer-events-none absolute right-[0] top-1/2 h-6 w-6 -translate-y-1/2 transition-transform duration-200 ease-in-out",
				)}
			/>
		</div>
	);
});
