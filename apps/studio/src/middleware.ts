import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	if (process.env.NODE_ENV === "development") {
		return NextResponse.next({
			request,
		});
	}

	// based off the examples presented on:
	// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy

	const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
	const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' 'unsafe-inline';
		frame-src https://challenges.cloudflare.com/;
        connect-src *.google-analytics.com https://clerk.codemod.studio https://api.short.io https://telemetry.intuita.io https://backend.codemod.com https://codemod.studio https://vitals.vercel-insights.com;
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

	const contentSecurityPolicyHeaderValue = cspHeader
		.replace(/\s{2,}/g, " ")
		.trim();

	const headers = new Headers(request.headers);
	headers.set("x-nonce", nonce);
	headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

	const response = NextResponse.next({
		request: {
			headers,
		},
	});

	response.headers.set(
		"Content-Security-Policy",
		contentSecurityPolicyHeaderValue,
	);

	return response;
}

// based off the examples presented on:
// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy

export const config = {
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
