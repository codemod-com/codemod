import { Analytics } from '@vercel/analytics/react';
import { type Metadata, type Viewport } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { ReduxProvider } from '~/lib/context/state';
import { ThemeProvider } from '~/pageComponents/main/themeContext';
import AuthProvider from '../auth/AuthProvider';
import '../index.css';

export const metadata: Metadata = {
	title: 'Codemod Studio',
	description:
		'Build codemods instantly with the help of AI, specialized helpers, debuggers, and a vibrant community of Codemod Champions.',
	keywords:
		'codemod studio, codemod, codemods, codebase migration, code evolution',
	manifest: './manifest.json',
	icons: {
		icon: './favicon.ico',
		apple: './logo192.png',
	},
	twitter: {
		title: 'Codemod Studio',
		description:
			'Build codemods instantly with the help of AI, specialized helpers, debuggers, and a vibrant community of Codemod Champions.',
		creator: '@codemod',
	},
	openGraph: {
		title: 'Codemod Studio',
		description:
			'Build codemods instantly with the help of AI, specialized helpers, debuggers, and a vibrant community of Codemod Champions.',
		url: 'https://codemod.studio',
		siteName: 'Codemod Studio',
		locale: 'en_US',
	},
};

export const viewport: Viewport = {
	themeColor: 'black',
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const nonce = headers().get('x-nonce') ?? undefined;

	return (
		<html lang="en" className="h-full">
			<head>
				{/* gtag  */}
				{/* <Script
					id="gtag"
					src="https://www.googletagmanager.com/gtag/js?id=G-Z2CH6QVR9N"
					nonce={nonce}
				/> */}
				<Script id="gtm" nonce={nonce}>
					{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
						new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
						j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
						'https://www.googletagmanager.com/gtm.js?id='+i+dl;var n=d.querySelector('[nonce]');
						n&&j.setAttribute('nonce',n.nonce||n.getAttribute('nonce'));f.parentNode.insertBefore(j,f);
						})(window,document,'script','dataLayer','GTM-K32HQ25J');`}
				</Script>
				<Script id="marker-config" nonce={nonce}>
					{`  
      window.markerConfig = {
          project: '64de32c96b8fd94e18f7a00a', 
          source: 'snippet'
        };
    `}
				</Script>
				<Script id="install-marker">
					{`
        !function(e,r,a){if(!e.__Marker){e.__Marker={};var t=[],n={__cs:t};["show","hide","isVisible","capture","cancelCapture","unload","reload","isExtensionInstalled","setReporter","setCustomData","on","off"].forEach(function(e){n[e]=function(){var r=Array.prototype.slice.call(arguments);r.unshift(e),t.push(r)}}),e.Marker=n;var s=r.createElement("script");s.async=1,s.src="https://edge.marker.io/latest/shim.js";var i=r.getElementsByTagName("script")[0];i.parentNode.insertBefore(s,i)}}(window,document);
      `}
				</Script>
			</head>
			<AuthProvider>
				<ReduxProvider>
					<ThemeProvider>
						<body className="h-full w-full">
							<div id="root" className="h-full w-full">
								{children}
							</div>

							<Analytics />
						</body>
					</ThemeProvider>
				</ReduxProvider>
			</AuthProvider>
		</html>
	);
}
