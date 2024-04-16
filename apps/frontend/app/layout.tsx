import globalFontsVariables from "@/fonts";
import { Analytics } from "@vercel/analytics/react";
import { cx } from "cva";

import { mediaStyles } from "@/components/global/Media";
import dynamicFavicon from "@/headScripts/dynamic_favicon";
import themeScript from "@/headScripts/theme";

import "@/styles/globals.css";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={cx(globalFontsVariables, "scroll-smooth")}>
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
				{children}
				<Analytics />
			</body>
		</html>
	);
}
