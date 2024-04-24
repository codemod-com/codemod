"use client";

import GlobalLayout from "@/components/global/GlobalLayout";
import { GLOBAL_QUERY } from "@/data/sanity/queries";
import type { GlobalPagePayload } from "@/types";
import { useQuery } from "@sanity/react-loader";

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
