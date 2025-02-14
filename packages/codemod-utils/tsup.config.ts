import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      incremental: false, // Fix for incremental error
    },
  },
  clean: true,
  sourcemap: true,
});
