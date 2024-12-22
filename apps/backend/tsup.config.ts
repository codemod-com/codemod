import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  target: "node20",
  bundle: true,
  outDir: "build",
  noExternal: [/(.*)/],
});
