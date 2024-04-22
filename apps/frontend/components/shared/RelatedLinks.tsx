import NavigationLink from "@/components/global/Navigation/NavigationLink";
import { cx } from "cva";
import React from "react";

type RelatedLinks = {
	className?: string;
	title: string;
	textStyle?: "default" | "medium" | "large";
	links: {
		title: string;
		href: string;
	}[];
};

export default function RelatedLinks(props: RelatedLinks) {
	return (
		<div className={cx(props.className)}>
			<h3 className="body-s-medium mb-xs font-medium text-secondary-light dark:text-secondary-dark">
				{props.title}
			</h3>
			<div className="flex flex-col items-start gap-s">
				{props?.links?.map((link) => (
					<NavigationLink
						textStyle={props.textStyle}
						key={link.href}
						href={link.href}
					>
						{link?.title}
					</NavigationLink>
				))}
			</div>
		</div>
	);
}
