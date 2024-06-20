import dynamic from "next/dynamic";
import { draftMode } from "next/headers";

import BlogArticle from "@/components/templates/BlogArticlePage/BlogArticle";
import BlogArticlePreview from "@/components/templates/BlogArticlePage/BlogArticlePreview";
import { Page } from "@/components/templates/ModularPage/Page";
import TextPage from "@/components/templates/RichTextPage/TextPage";
import TextPagePreview from "@/components/templates/RichTextPage/TextPagePreview";
import { loadSanityPageByRouteProps } from "@/data/sanity";
import { client } from "@/data/sanity/client";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { BlogArticlePayload, RouteProps, TextPagePayload } from "@/types";
import type { QueryResponseInitial } from "@sanity/react-loader";
import type { ResolvingMetadata } from "next";
import { groq } from "next-sanity";
import { notFound } from "next/navigation";

const PagePreview = dynamic(
	() => import("@/components/templates/ModularPage/PagePreview"),
);

export async function generateMetadata(
	props: RouteProps,
	parent: ResolvingMetadata,
) {
	const initialData = await loadSanityPageByRouteProps(props);

	if (!initialData?.data) return notFound();

	return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function DynamicRoute(props: RouteProps) {
	const initial = await loadSanityPageByRouteProps(props);

	if (!initial.data) {
		notFound();
	}

	switch (initial.data._type) {
		case "page":
			return draftMode().isEnabled ? (
				<PagePreview initial={ initial }/>
			) : (
				<Page data={ initial.data }/>
			);
		case "textPage":
			return draftMode().isEnabled ? (
				<TextPagePreview
					initial={ initial as QueryResponseInitial<TextPagePayload | null> }
				/>
			) : (
				<TextPage data={ initial.data as TextPagePayload }/>
			);
		case "blog.article":
		case "blog.customerStory":
			return draftMode().isEnabled ? (
				<BlogArticlePreview
					initial={ initial as QueryResponseInitial<BlogArticlePayload | null> }
				/>
			) : (
				<BlogArticle data={ initial.data as BlogArticlePayload }/>
			);

		// %CLI/TEMPLATE-CASE%
		default:
			return <div>Template not found</div>;
	}
}

export async function generateStaticParams() {
	const pages = await client.fetch(
		groq`*[_type in ['modularPage', 'textPage', 'blog.article', 'blog.customerStory']]`,
	);

	const paths = pages.map((page: any) => ({
		path: page.pathname.current.split("/").filter(Boolean),
	}));

	return paths;
}
