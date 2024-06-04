import { build } from "esbuild";

build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outdir: "./dist",
  legalComments: "inline",
  logLevel: "silent",
});
