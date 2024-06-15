import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  draftMode().disable();
  let url = new URL(request.nextUrl);
  let redirectTo = url.searchParams.get("redirectTo");
  return NextResponse.redirect(new URL(redirectTo || "/", url.origin));
}
