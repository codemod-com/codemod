import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    outfile: "build/index.js",
    external: ["@prisma/client", "pg-hstore", "@codemod-com/utilities"],
    banner: {
      js: `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);`,
    },
    format: "esm",
  })
  .catch(() => process.exit(1));
