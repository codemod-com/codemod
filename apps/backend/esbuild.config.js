import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  outfile: "build/index.js",
  banner: {
    js: `
      import { createRequire } from 'module';
      import { fileURLToPath, URL } from 'url';
      import path from 'path';
      const require = createRequire(import.meta.url);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      `,
  },
  format: "esm",
  plugins: [
    copy({
      assets: [
        {
          from: [
            "./node_modules/@codemod-com/database/generated/prisma-client/schema.prisma",
          ],
          to: ["../generated/prisma-client/schema.prisma"],
        },
      ],
    }),
  ],
}).catch(() => process.exit(1));
