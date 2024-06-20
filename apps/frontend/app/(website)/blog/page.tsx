import BlogIndex from "@/components/templates/blogIndex/BlogIndex";
import { loadBlogIndex } from "@/data/sanity/loadQuery";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";

import type { Metadata, ResolvingMetadata } from "next";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

const BlogIndexPreview = dynamic(
	() => import("@/components/templates/blogIndex/BlogIndexPreview"),
);

export async function generateMetadata(
	{
		params,
	}: {
		params: { locale: string; tag?: string };
	},
	parent: ResolvingMetadata,
): Promise<Metadata | null> {
	const initialData = await loadBlogIndex({
		pageNumber: 1,
		pathParam: params.tag,
	});
	if (!initialData?.data) return notFound();

	return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function BlogIndexRoute({
	                                             params,
                                             }: {
	params: { locale: string; tag?: string };
}) {
	const initialSanityData = await loadBlogIndex({
		pageNumber: 1,
		pathParam: params.tag,
	});

	if (!initialSanityData) {
		notFound();
	}
	return draftMode().isEnabled ? (
		<BlogIndexPreview
			initial={ initialSanityData }
			locale={ params.locale }
			pathParam={ params.tag }
		/>
	) : (
		<BlogIndex data={ initialSanityData.data } pathParam={ params.tag }/>
	);
}
