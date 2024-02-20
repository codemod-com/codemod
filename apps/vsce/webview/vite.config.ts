/* eslint-disable import/no-extraneous-dependencies */
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import svgrPlugin from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";

const target = process.env.TARGET_APP ?? "";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			react: "preact/compat",
			"react-dom": "preact/compat",
		},
	},
	build: {
		assetsInlineLimit: 10000,
		outDir: `build/${target}`,
		rollupOptions: {
			input: {
				[target]: fileURLToPath(
					new URL(`./src/${target}/index.html`, import.meta.url),
				),
			},
			output: {
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name].[ext]",
			},
		},
	},
	define: {
		"process.env": {},
	},
	plugins: [react(), viteTsconfigPaths(), svgrPlugin(), monacoEditorPlugin({})],
});
