import MonacoEditorPlugin from "monaco-editor-webpack-plugin";

/** @type {import('next').NextConfig} */
const config = {
	webpack: (config, { isServer, webpack }) => {
		if (!isServer) {
			config.plugins.push(
				new MonacoEditorPlugin({
					languages: ["typescript", "html", "css", "json"],
					filename: "static/[name].worker.js",
					publicPath: "/_next",
				}),
			);
		}

		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
				resource.request = resource.request.replace(/^node:/, "");
			}),
		);

		return {
			...config,
			module: {
				...config.module,
				rules: [
					...config.module.rules,
					{
						test: /\.txt$/i,
						use: "raw-loader",
					},
				],
			},
			resolve: {
				...config.resolve,
				fallback: {
					...config.resolve.fallback,
					fs: false,
					crypto: false,
					buffer: false,
					stream: false,
				},
			},
		};
	},
	images: {
		remotePatterns: [{ hostname: "cdn.sanity.io" }],
	},
	typescript: {
		// Set this to false if you want production builds to abort if there's type errors
		ignoreBuildErrors: true,
	},
	eslint: {
		/// Set this to false if you want production builds to abort if there's lint errors
		ignoreDuringBuilds: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	experimental: {
		taint: true,
	},
	async redirects() {
		return [
			{
				source: "/automations/eslint-to-biome-migrate-rules/",
				destination: "/registry/biome-migrate-rules",
				permanent: false,
			},
			{
				source: "/automations/mocha-to-vitest-migration-recipe/",
				destination: "/registry/mocha-vitest-recipe",
				permanent: false,
			},
			{
				source: "/automations/:slug*",
				destination: "/registry/:slug*",
				permanent: true,
			},
		];
	},
};

export default config;
