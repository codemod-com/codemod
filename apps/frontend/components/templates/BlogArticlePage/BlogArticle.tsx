import PageCta from "@/components/templates/ModularPage/PageCta";
import type { BlogArticlePayload } from "@/types";
import BlogArticlePageContent from "./BlogArticlePageContent";

export interface BlogArticlePageProps {
	data: BlogArticlePayload;
}

export default function BlogArticlePage({ data }: BlogArticlePageProps) {
	return (
		<>
			<BlogArticlePageContent {...data} />
			{data?.pageCta && <PageCta {...data.pageCta} />}
		</>
	);
}
