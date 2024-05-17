import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next({
      request,
    });
  }

  // based off the examples presented on:
  // https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy

  let nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  let cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' 'unsafe-inline';
		frame-src https://challenges.cloudflare.com/;
        connect-src *.google-analytics.com https://clerk.codemod.com https://api.short.io https://backend.codemod.com https://codemod.com https://vitals.vercel-insights.com https://summary-walrus-25.clerk.accounts.dev;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com https://img.clerk.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `;

  let contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, " ")
    .trim();

  let headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  let response = NextResponse.next({
    request: {
      headers,
    },
  });

  return response;
}

// based off the examples presented on:
// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy

export let config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
