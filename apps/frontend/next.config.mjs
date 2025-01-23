import MonacoEditorPlugin from "monaco-editor-webpack-plugin";

const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;
const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' ${backendApiUrl} ${authApiUrl} https://challenges.cloudflare.com;
  connect-src 'self' ${backendApiUrl} ${authApiUrl};
  img-src 'self' https://img.clerk.com;
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  frame-src 'self' https://challenges.cloudflare.com;
  form-action 'self';
`;

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
  experimental: {
    taint: true,
  },
  async redirects() {
    return [
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
};

export default config;
