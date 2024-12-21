import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: false,
    platform: "node",
    outfile: "build/index.js",
    format: "esm",
  })
  .catch(() => process.exit(1));
