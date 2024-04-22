import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";

import GlobalLayout from "@/components/global/GlobalLayout";
import GlobalLayoutPreview from "@/components/global/GlobalLayoutPreview";
import config from "@/config";
import { loadGlobalData } from "@/data/sanity";
import { GLOBAL_QUERY } from "@/data/sanity/queries";
import { getOgImages } from "@/data/sanity/resolveSanityRouteMetadata";

const LiveVisualEditing = dynamic(
	() => import("@/components/LiveVisualEditing"),
);

export async function generateMetadata(): Promise<Metadata> {
	const { data } = await loadGlobalData(GLOBAL_QUERY);

	return {
		title: config.siteName,
		openGraph: {
			title: config.siteName,
			images: !data?.fallbackOGImage
				? undefined
				: getOgImages(data.fallbackOGImage),
		},
	};
}

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const globalData = await loadGlobalData(GLOBAL_QUERY);

	return (
		<>
			{globalData.data &&
				(draftMode().isEnabled ? (
					<GlobalLayoutPreview data={globalData.data}>
						{children}
					</GlobalLayoutPreview>
				) : (
					<GlobalLayout data={globalData.data}>{children}</GlobalLayout>
				))}
			{draftMode().isEnabled && <LiveVisualEditing />}
		</>
	);
}
