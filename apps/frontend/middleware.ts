import { getRedirect } from "@/data/sanity/redirects";
// @TODO @codemod-com/utilities imports node runtime libs, cannot be used in midddleware
// @TODO modular import @codemod-com/utilities/constants
// import {
//   CODEMOD_STUDIO_URL,
//   OLD_STUDIO_HOSTNAME,
// } from "@codemod-com/utilities";

let CODEMOD_STUDIO_URL = "https://codemod.com/studio";
let OLD_STUDIO_HOSTNAME = "codemod.studio";

import { type NextRequest, NextResponse } from "next/server";

// @TODO: Handle redirects from Sanity
export async function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === OLD_STUDIO_HOSTNAME) {
    return NextResponse.redirect(new URL(CODEMOD_STUDIO_URL));
  }

  let pathname = request.nextUrl.pathname;
  // @TODO fix sanity in middleware error
  let redirect = await getRedirect(pathname);

  if (redirect) {
    return NextResponse.redirect(new URL(redirect.destination, request.url), {
      status: redirect.permanent ? 301 : 302,
    });
  }
}

export let config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manage|blocks|favicons|fonts|images|studio-docs).*)",
  ],
};
