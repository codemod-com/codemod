"use client";

import type { QueryResponseInitial } from "@sanity/react-loader/rsc";

import { buildBlogIndexQuery } from "@/data/sanity/queries";
import { useQuery } from "@/data/sanity/useQuery";
import type { BlogIndexPayload } from "@/types";

import BlogIndex from "./BlogIndex";

type PreviewRouteProps = {
	pathParam?: string;
	locale: string;
	initial: QueryResponseInitial<BlogIndexPayload | null>;
};

export default function BlogIndexPreview(props: PreviewRouteProps) {
	const { initial, locale, pathParam } = props;

	const blogIndexDocQuery = buildBlogIndexQuery({
		infiniteLoading: true,
		pathParam,
		sortBy: "publishDate",
		sortOrder: "desc",
	});

	const { data } = useQuery<BlogIndexPayload | null>(
		blogIndexDocQuery,
		{ pathname: "/blog", locale },
		{ initial },
	);

	return <BlogIndex data={data!} pathParam={pathParam} />;
}
