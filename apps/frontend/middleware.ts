import { getRedirect } from "@/data/sanity/redirects";
// @TODO @codemod-com/utilities imports node runtime libs, cannot be used in midddleware
// @TODO modular import @codemod-com/utilities/constants
// import {
//   CODEMOD_STUDIO_URL,
//   OLD_STUDIO_HOSTNAME,
// } from "@codemod-com/utilities";

const CODEMOD_STUDIO_URL = "https://codemod.com/studio";
const OLD_STUDIO_HOSTNAME = "codemod.studio";

import { type NextRequest, NextResponse } from "next/server";

// @TODO: Handle redirects from Sanity
export async function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === OLD_STUDIO_HOSTNAME) {
    return NextResponse.redirect(new URL(CODEMOD_STUDIO_URL));
  }

  const pathname = request.nextUrl.pathname;
  // @TODO fix sanity in middleware error
  const redirect = await getRedirect(pathname);

  if (redirect) {
    return NextResponse.redirect(new URL(redirect.destination, request.url), {
      status: redirect.permanent ? 301 : 302,
    });
  }

  // only backend should be able to call this endpoint
  if (request.nextUrl.pathname === "/api/revalidate") {
    const res = NextResponse.next();

    res.headers.append("Access-Control-Allow-Credentials", "true");
    res.headers.append(
      "Access-Control-Allow-Origin",
      "https://backend.codemod.com",
    );
    res.headers.append(
      "Access-Control-Allow-Methods",
      "GET,DELETE,PATCH,POST,PUT",
    );
    res.headers.append(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    );

    return res;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manage|blocks|favicons|fonts|images|studio-docs).*)",
  ],
};
