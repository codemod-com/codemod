import { loadRegistryAPIData } from "@/data/codemod/loaders";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body = await req.json();

  try {
    let apiRes = await loadRegistryAPIData({
      pageNumber: body.pageNumber,
      searchParams: body.searchParams,
      entriesPerPage: body.entriesPerPage,
    });

    if (!apiRes) {
      throw new Error("No Results");
    }

    return NextResponse.json(apiRes, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}
