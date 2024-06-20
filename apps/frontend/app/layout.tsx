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
		<html lang="en" className={ cx(globalFontsVariables, "scroll-smooth light") }>
		<head>
			<Script id="gtm">
				{ `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
						new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
						j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
						'https://www.googletagmanager.com/gtm.js?id='+i+dl;var n=d.querySelector('[nonce]');
						n&&j.setAttribute('nonce',n.nonce||n.getAttribute('nonce'));f.parentNode.insertBefore(j,f);
						})(window,document,'script','dataLayer','GTM-K32HQ25J');` }
			</Script>
			<script dangerouslySetInnerHTML={ { __html: dynamicFavicon } }/>
			<script dangerouslySetInnerHTML={ { __html: themeScript } }/>
			<style
				key="fresnel-css"
				dangerouslySetInnerHTML={ { __html: mediaStyles } }
				type="text/css"
			/>
		</head>
		<body>
		{ children }
		<Analytics/>
		</body>
		</html>
	);
}
