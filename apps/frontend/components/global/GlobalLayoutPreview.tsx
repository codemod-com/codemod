"use client";

import { GLOBAL_QUERY } from "@/data/sanity/queries";
import type { GlobalPagePayload } from "@/types";
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
		<div className="flex min-h-svh w-full flex-col items-center">
			<Navigation data={data?.navigation!} />
			<main className="w-full max-w-[1312px]">{children}</main>
			<Footer data={data?.footer!} />
		</div>
	);
}
