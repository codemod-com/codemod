"use client";

import { cx } from "cva";
import { type PropsWithChildren, useRef } from "react";
import Icon from "../Icon";

type AccordionItemInternalProps = PropsWithChildren<{
	id?: string;
	title: string;
	border?: boolean;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	className?: string;
	variant?: "faq" | "toc";
}>;

export default function AccordionItemInternal({
	id,
	title,
	border = true,
	isOpen,
	setIsOpen,
	className,
	variant = "faq",
	children,
}: AccordionItemInternalProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<div
			id={id}
			className={cx(
				{
					"border-primary-dark-inactive border-b": border,
				},
				className,
			)}
		>
			<button
				className={cx("flex w-full items-center justify-between", {
					"py-0": variant !== "toc",
					"py-1": variant === "toc",
				})}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="flex w-full justify-between">
					<h3
						className={cx("text-start", {
							"body !font-medium": variant === "faq",
							caption: variant === "toc",
						})}
					>
						{title}
					</h3>

					{variant === "faq" && (
						<Icon
							name="chevron-down"
							className={cx(
								"h-4 w-4 shrink-0 transform fill-primary-dark transition-transform duration-300",
								{
									"rotate-180": isOpen,
								},
							)}
						/>
					)}
				</div>
			</button>
			<div
				ref={contentRef}
				className={cx(
					"mt- mt-[1rem] overflow-hidden transition-[max-height] duration-300",
				)}
				style={{
					maxHeight: isOpen ? contentRef.current?.scrollHeight : 0,
				}}
			>
				{children}
			</div>
		</div>
	);
}
