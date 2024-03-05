import esbuild from "esbuild";

esbuild
	.build({
		entryPoints: ["src/server.ts"],
		bundle: true,
		minify: true,
		platform: "node",
		outfile: "build/server.js",
		external: ["@prisma/client", "pg-hstore"],
		banner: {
			js: `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);`,
		},
		format: "esm",
	})
	.catch(() => process.exit(1));
