"use client";

import { useHideMenu } from "@/components/global/useHideMenu";
import { GLOBAL_QUERY } from "@/data/sanity/queries";
import type { GlobalPagePayload } from "@/types";
import { cn } from "@/utils";
import { useQuery } from "@sanity/react-loader";
import Footer from "./Footer";
import Navigation from "./Navigation";

export default function GlobalLayoutPreview({
	data: initial,
	children,
}: {
	data: GlobalPagePayload;
	children: any;
}) {
	const { data } = useQuery<GlobalPagePayload | null>(GLOBAL_QUERY, {
		initial,
	});

	const hideMenu = useHideMenu();
	return (
		<div className="flex min-h-svh w-full flex-col items-center">
			{!hideMenu && <Navigation data={data?.navigation!} />}
			<main className={cn("w-full', 'max-w-[1312px]")}>{children}</main>
			{!hideMenu && <Footer data={data?.footer!} />}
		</div>
	);
}
