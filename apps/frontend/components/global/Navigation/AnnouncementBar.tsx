import Icon from "@/components/shared/Icon";
import { RichText } from "@/components/shared/RichText";
import type { NavigationPayload } from "@/types";
import { cx } from "cva";
import { useState } from "react";

type AnnouncementBarProps = {
	data: NavigationPayload["announcementBar"];
};

export default function AnnouncementBar({ data }: AnnouncementBarProps) {
	const [dismissed, setDismissed] = useState(false);

	return !dismissed ? (
		<div className="flex w-full justify-center bg-accent">
			<div
				className={cx(
					"body-s-medium relative flex w-full max-w-[1312px] select-none items-center justify-center px-[20px] py-xs text-center font-medium text-primary-light lg:px-m",
				)}
			>
				{data?.message && <RichText value={data?.message} />}

				{data?.dismissable ? (
					<button
						className="absolute right-[20px] top-1/2 -translate-y-1/2 transform cursor-pointer lg:right-m"
						onClick={() => {
							const headerHeight = getComputedStyle(
								document.documentElement,
								null,
							).getPropertyValue("--header-height");
							document.documentElement.style.setProperty(
								"--header-height",
								`calc(${headerHeight} - 36px)`,
							);
							setDismissed(true);
						}}
					>
						<Icon name="close" />
					</button>
				) : null}
			</div>
		</div>
	) : null;
}
