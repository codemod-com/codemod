import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: [...configDefaults.include, "**/test/*.ts"],
    passWithNoTests: true,
    testTimeout: 15_000,
  },
});
