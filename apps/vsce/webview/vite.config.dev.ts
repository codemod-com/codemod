import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";

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
	},
	define: {
		"process.env": {},
	},
	plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
});
