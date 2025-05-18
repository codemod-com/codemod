import path from "node:path";
import { fileURLToPath } from "node:url";
import MonacoEditorPlugin from "monaco-editor-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoEditorPlugin({
          languages: ["typescript", "html", "css", "json"],
          filename: "static/[name].worker.js",
          publicPath: "/_next",
        }),
      );
    }

    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      }),
    );

    // Add plugin to handle .js extensions in imports from .ts files
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/\.js$/, (resource) => {
        // Apply to internal imports in both packages
        if (
          (resource.context.includes("packages/codemod-utils/src") ||
            resource.context.includes("packages/utilities/src")) &&
          resource.request.startsWith("./") &&
          resource.request.endsWith(".js")
        ) {
          resource.request = resource.request.replace(/\.js$/, ".ts");
        }
      }),
    );

    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.txt$/i,
            use: "raw-loader",
          },
        ],
      },
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
          crypto: false,
          buffer: false,
          stream: false,
          child_process: false,
        },
        alias: {
          ...config.resolve.alias,
          "@codemod-com/utilities": path.resolve(
            __dirname,
            "../../packages/utilities/src",
          ),
          "@codemod.com/codemod-utils": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src",
          ),
          "@codemod-com/filemod": path.resolve(
            __dirname,
            "../../packages/filemod/src",
          ),
          // Add aliases for each jscodeshift module to handle .js extensions
          "./jscodeshift/import-declaration.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/import-declaration.ts",
          ),
          "./jscodeshift/class.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/class.ts",
          ),
          "./jscodeshift/call-expression.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/call-expression.ts",
          ),
          "./jscodeshift/react.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/react.ts",
          ),
          "./jscodeshift/global.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/global.ts",
          ),
          "./jscodeshift/function.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/function.ts",
          ),
          "./jscodeshift/tests.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/tests.ts",
          ),
          "./jscodeshift/parser.js": path.resolve(
            __dirname,
            "../../packages/codemod-utils/src/jscodeshift/parser.ts",
          ),
        },
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
      },
    };
  },
  images: {
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  transpilePackages: [
    "@codemod-com/utilities",
    "@codemod.com/codemod-utils",
    "@codemod-com/filemod",
  ],
  // Remove modularizeImports as it's causing issues with barrel imports
  experimental: {
    // taint is now stable in Next.js 15
    externalDir: true,
  },
  async redirects() {
    return [
      {
        source: "/studio",
        has: [
          {
            type: "query",
            key: "c",
          },
        ],
        destination: "/studio-jscodeshift",
        permanent: true,
      },

      {
        source: "/studio",
        destination: "https://app.codemod.com/studio",
        permanent: false,
      },
      {
        source: "/automations/eslint-to-biome-migrate-rules/",
        destination: "/registry/biome-migrate-rules",
        permanent: false,
      },
      {
        source: "/automations/mocha-to-vitest-migration-recipe/",
        destination: "/registry/mocha-vitest-recipe",
        permanent: false,
      },
      {
        source: "/automations/:slug*",
        destination: "/registry/:slug*",
        permanent: true,
      },
    ];
  },
};

export default config;
