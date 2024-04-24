import type { SanityLinkType } from "@/types";
import type { LinkData } from "@/types/generic.types";
import { isExternalUrl } from "@/utils/urls";
import { vercelStegaSplit } from "@vercel/stega";
import Link from "next/link";
import { Component, type ComponentProps, forwardRef } from "react";

export interface SanityLinkProps extends ComponentProps<"a"> {
	link: Partial<LinkData> | SanityLinkType;
	scroll?: boolean;
}

export const SanityLink = forwardRef<
	HTMLAnchorElement,
	React.PropsWithChildren<SanityLinkProps>
>(function SanityLink(props, ref) {
	const { link, ...rest } = props;
	const href = link.href || "";
	const { cleaned } = vercelStegaSplit(href);
	const isExternal = isExternalUrl(cleaned);

	if (!href) {
		return (
			<span ref={ref} {...rest}>
				{props.children}
			</span>
		);
	}

	if (isExternal) {
		return (
			<a
				{...rest}
				href={cleaned}
				target="_blank"
				rel="noopener noreferrer"
				tabIndex={0}
				ref={ref}
			>
				{props.children}
			</a>
		);
	}

	return (
		<Link {...rest} href={href} tabIndex={0} ref={ref} prefetch>
			{props.children}
		</Link>
	);
});
