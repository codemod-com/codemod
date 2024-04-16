import { getRedirect } from "@/data/sanity/redirects";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// @TODO: Handle redirects from Sanity
export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const redirect = await getRedirect(pathname);

	if (redirect) {
		return NextResponse.redirect(new URL(redirect.destination, request.url), {
			status: redirect.permanent ? 301 : 302,
		});
	}
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|manage|blocks|favicons|fonts|images|studio-docs).*)",
	],
};
