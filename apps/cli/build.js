import { build } from "esbuild";
import { hideBin } from "yargs/helpers";

// Build envs for local production build, can be used by running `pnpm build --prod`
const localProdBuildEnvs = {
  "process.env.NODE_ENV": '"production"',
  "process.env.BACKEND_URL": '"https://backend.codemod.com"',
  "process.env.AUTH_BACKEND_URL": '"https://backend.codemod.com/auth"',
  "process.env.CODEMOD_HOME_PAGE_URL": '"https://codemod.com"',
  "process.env.CODEMOD_STUDIO_URL": '"https://codemod.com/studio"',
  "process.env.IGNORE_TELEMETRY": "true",
};

// Build envs for staging, it is the default when running `pnpm build`
const stagingBuildEnvs = {
  "process.env.NODE_ENV": '"staging"',
  "process.env.BACKEND_URL": '"https://staging-backend.codemod.com"',
  "process.env.AUTH_BACKEND_URL": '"https://staging-backend.codemod.com/auth"',
  "process.env.CODEMOD_HOME_PAGE_URL": '"https://staging.codemod.com"',
  "process.env.CODEMOD_STUDIO_URL": '"https://staging.codemod.com/studio"',
  "process.env.IGNORE_TELEMETRY": "true",
};

// Build envs for publishing to npm, it would usually happen during prepublishOnly script
const publishEnvs = {
  ...localProdBuildEnvs,
  "process.env.IGNORE_TELEMETRY": "false",
};

// Build envs for local development where one would boot up the backend services and frontend locally
// Can be used by running `pnpm build --local`
const localEnvs = {
  "process.env.NODE_ENV": '"development"',
  "process.env.BACKEND_URL": '"http://localhost:8081"',
  "process.env.AUTH_BACKEND_URL": '"http://localhost:8080"',
  "process.env.CODEMOD_HOME_PAGE_URL": '"http://localhost:3000"',
  "process.env.CODEMOD_STUDIO_URL": '"http://localhost:3000/studio"',
  "process.env.IGNORE_TELEMETRY": "true",
};

const argv = hideBin(process.argv);

build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  legalComments: "inline",
  outfile: "./dist/index.cjs",
  define: argv.includes("--local")
    ? localEnvs
    : argv.includes("--prod")
      ? localProdBuildEnvs
      : argv.includes("--publish")
        ? publishEnvs
        : stagingBuildEnvs,
  external: [
    "esbuild",
    "@ast-grep/napi",
    "@ast-grep/cli",
    "@octokit/rest",
    "keytar",
    "prettier",
    "blessed",
    // Workaround for @vue/compiler-sfc dynamic require
    "react",
    "mustache",
    "templayed",
    "handlebars",
    "jazz",
    "jqtpl",
    "velocityjs",
    "dustjs-linkedin",
    "atpl",
    "liquor",
    "twig",
    "ejs",
    "eco",
    "hamljs",
    "hamlet",
    "whiskers",
    "haml-coffee",
    "hogan.js",
    "walrus",
    "just",
    "ect",
    "mote",
    "toffee",
    "dot",
    "bracket-template",
    "ractive",
    "htmling",
    "plates",
    "vash",
    "slm",
    "marko",
    "teacup/lib/express",
    "coffee-script",
    "squirrelly",
    "twing",
  ],
});
