import { mediaStyles } from "@/components/global/Media";
import globalFontsVariables from "@/fonts";
import dynamicFavicon from "@/headScripts/dynamic_favicon";
import themeScript from "@/headScripts/theme";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { cx } from "cva";

import "@/styles/globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={cx(globalFontsVariables, "scroll-smooth light")}>
      <GoogleTagManager gtmId={gtmId as string} />
      <GoogleAnalytics gaId={gaId as string} />
      <head>
        <script dangerouslySetInnerHTML={{ __html: dynamicFavicon }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style
          key="fresnel-css"
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
          type="text/css"
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
