import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  draftMode().disable();
  const url = new URL(request.nextUrl);
  const redirectTo = url.searchParams.get("redirectTo");
  return NextResponse.redirect(new URL(redirectTo || "/", url.origin));
}
