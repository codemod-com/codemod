"use client";

import { cx } from "cva";
import type { PortableTextBlock } from "next-sanity";
import { useState } from "react";
import Icon from "../../Icon";
import { RichText } from "../../RichText";

export default function Collapsible(props: {
	title?: string;
	content?: PortableTextBlock[];
}) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div className="my-10 w-full rounded-lg border-l-[4px] border-tertiary-light bg-emphasis-light px-m py-s last:mb-0 dark:border-tertiary-dark/10 dark:bg-emphasis-dark">
			<button
				className={cx(
					"flex w-full items-center gap-2 border-b border-border-light py-2 dark:border-border-dark",
					{
						"border-none": !isOpen,
						"mb-4": isOpen,
					},
				)}
				onClick={() => setIsOpen((curr) => !curr)}
			>
				<Icon name="chevron-down" className={cx({ "-rotate-90": !isOpen })} />

				<h3 className="xs-heading">{props.title}</h3>
			</button>

			{isOpen && props.content && <RichText value={props.content} />}
		</div>
	);
}
