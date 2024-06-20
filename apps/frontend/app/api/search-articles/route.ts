import { client } from "@/data/sanity/client";
import { BLOG_ARTICLE_CARD_FRAGMENT } from "@/data/sanity/queries";
import { token } from "@/data/sanity/token";
import { type NextRequest, NextResponse } from "next/server";

let clientWithToken = client.withConfig({ token });

export async function POST(req: NextRequest) {
  let body = await req.json();
  try {
    let { textSearch, limit = 10, preview = false } = body;

    let textQuery = textSearch ? `&& title match "**${textSearch}**"` : "";

    let score = body.textSearch
      ? `| score(title match "**${textSearch}**")`
      : "";
    let order = preview
      ? "| order(_score desc, _updatedAt desc)"
      : "| order(_score desc, publishedAt desc)";
    let limitQuery = limit ? `[0...${limit}]` : "";

    let fetchQuery = `*[ _type in ["blog.article", "blog.customerStory"] ${textQuery}]{
        ${BLOG_ARTICLE_CARD_FRAGMENT}
        _score
      } ${score}${order}${limitQuery}`;

    let res = await clientWithToken.fetch(fetchQuery);

    return NextResponse.json(res, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}
