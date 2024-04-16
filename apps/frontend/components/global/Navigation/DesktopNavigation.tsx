import Button from "@/components/shared/Button";
import type { NavigationPayload, SanityLinkType } from "@/types";
import NavigationLink from "./NavigationLink";

type DesktopNavigationProps = {
	items: SanityLinkType[];
};

// Desktop navigation items
export function DesktopNavigationItems({ items }: DesktopNavigationProps) {
	return (
		<div className="hidden gap-l lg:flex lg:flex-1 lg:items-center lg:justify-center">
			{items?.map((item) => (
				<NavigationLink key={item.href} href={item.href}>
					{item.label}
				</NavigationLink>
			))}
		</div>
	);
}

// Desktop navigation right
export function DesktopNavigationRight(props: {
	items: NavigationPayload["navigationCtas"];
}) {
	return (
		<div className="hidden gap-3 lg:flex lg:items-center lg:justify-center">
			{props.items
				?.map((item, index) => (
					<NavigationLink hideExternalIcon key={item._key} href={item?.href}>
						<Button
							glow={index === 0}
							intent={index === 0 ? "secondary" : "inline"}
						>
							{item?.label}
						</Button>
					</NavigationLink>
				))

				.reverse()}
		</div>
	);
}
