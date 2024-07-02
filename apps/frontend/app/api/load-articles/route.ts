import { loadBlogIndex } from "@/data/sanity/loadQuery";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const sanityRes = await loadBlogIndex({
      pageNumber: body.pageNumber,
      pathParam: body.pathParam,
    });

    if (!sanityRes) {
      throw new Error("No Results");
    }

    return NextResponse.json(sanityRes, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}
