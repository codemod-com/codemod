import { build } from "esbuild";

build({
	entryPoints: ["./src/index.ts"],
	bundle: true,
	minify: true,
	platform: "node",
	target: "node18",
	format: "cjs",
	legalComments: "inline",
	outfile: "./dist/index.cjs",
	external: ["esbuild"],
});
