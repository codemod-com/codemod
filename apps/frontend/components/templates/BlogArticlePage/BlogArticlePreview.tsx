"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import { useQuery } from "@/data/sanity/useQuery";

import { BLOG_ARTICLE_QUERY, JOB_QUERY } from "@/data/sanity/queries";
import { type BlogArticlePayload, Job } from "@/types";
import BlogArticle from "./BlogArticle";

type Props = {
	initial: QueryResponseInitial<BlogArticlePayload | null>;
};

export default function BlogArticlePreview(props: Props) {
	const { initial } = props;
	const { data } = useQuery<BlogArticlePayload | null>(
		BLOG_ARTICLE_QUERY,
		{
			pathname: initial.data?.pathname,
			locale: "en",
		},
		{
			initial,
		},
	);

	return <BlogArticle data={data!} />;
}
