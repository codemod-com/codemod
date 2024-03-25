import MonacoEditorPlugin from "monaco-editor-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.plugins.push(
				new MonacoEditorPlugin({
					languages: ["typescript", "html", "css", "json"],
					filename: "static/[name].worker.js",
					publicPath: "/_next",
				}),
			);
		}

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
				},
			},
		};
	},
};

export default nextConfig;
