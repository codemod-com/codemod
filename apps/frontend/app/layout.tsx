import globalFontsVariables from "@/fonts";
import { Analytics } from "@vercel/analytics/react";
import { cx } from "cva";

import { mediaStyles } from "@/components/global/Media";
import dynamicFavicon from "@/headScripts/dynamic_favicon";
import themeScript from "@/headScripts/theme";

import "@/styles/globals.css";
import Script from "next/script";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cx(globalFontsVariables, "scroll-smooth light")}>
      <head>
        <Script id="gtm">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
						new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
						j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
						'https://www.googletagmanager.com/gtm.js?id='+i+dl;var n=d.querySelector('[nonce]');
						n&&j.setAttribute('nonce',n.nonce||n.getAttribute('nonce'));f.parentNode.insertBefore(j,f);
						})(window,document,'script','dataLayer','GTM-K32HQ25J');`}
        </Script>
        <script dangerouslySetInnerHTML={{ __html: dynamicFavicon }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style
          key="fresnel-css"
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
          type="text/css"
        />
        <Script>
          {`
          function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("Script");
          o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,
          o.onload=function(){window.trackingFunctions.onLoad({appId:"673fc665fd81de01b0053af5"})},
          document.head.appendChild(o)}
        initApollo();`}
        </Script>
        <Script>
          {`
          <!-- Google tag (gtag.js) -->
          <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11521847611">
          </script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-11521847611');`}
        </Script>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
