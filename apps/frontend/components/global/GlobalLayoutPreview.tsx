"use client";

import GlobalLayout from "@/components/global/GlobalLayout";
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

	return (
		<GlobalLayout data={data!} className={""}>
			{children}
		</GlobalLayout>
	);
}
