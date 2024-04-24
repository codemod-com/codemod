import { client } from "@/data/sanity/client";
import { BLOG_ARTICLE_CARD_FRAGMENT } from "@/data/sanity/queries";
import { token } from "@/data/sanity/token";
import { type NextRequest, NextResponse } from "next/server";

const clientWithToken = client.withConfig({ token });

export async function POST(req: NextRequest) {
	const body = await req.json();
	try {
		const { textSearch, limit = 10, preview = false } = body;

		const textQuery = textSearch ? `&& title match "**${textSearch}**"` : "";

		const score = body.textSearch
			? `| score(title match "**${textSearch}**")`
			: "";
		const order = preview
			? "| order(_score desc, _updatedAt desc)"
			: "| order(_score desc, publishedAt desc)";
		const limitQuery = limit ? `[0...${limit}]` : "";

		const fetchQuery = `*[ _type in ["blog.article", "blog.customerStory"] ${textQuery}]{
        ${BLOG_ARTICLE_CARD_FRAGMENT}
        _score
      } ${score}${order}${limitQuery}`;

		const res = await clientWithToken.fetch(fetchQuery);

		return NextResponse.json(res, {
			status: 200,
		});
	} catch (error) {
		return NextResponse.json({}, { status: 500 });
	}
}
