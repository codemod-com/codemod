import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/worker.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    outfile: "build/worker.js",
    banner: {
      js: `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);`,
    },
    format: "esm",
  })
  .catch(() => process.exit(1));
