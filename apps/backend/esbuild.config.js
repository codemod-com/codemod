import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: false,
    platform: "node",
    outfile: "build/index.cjs",
    format: "cjs",
  })
  .catch(() => process.exit(1));
