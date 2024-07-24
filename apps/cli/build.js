import { build } from "esbuild";
import { hideBin } from "yargs/helpers";

const localProdBuildEnvs = {
  "process.env.NODE_ENV": '"production"',
  "process.env.BACKEND_URL": '"https://backend.codemod.com"',
  "process.env.AUTH_BACKEND_URL": '"https://backend.codemod.com/auth"',
  "process.env.CODEMOD_HOME_PAGE_URL": '"https://codemod.com"',
  "process.env.CODEMOD_STUDIO_URL": '"https://codemod.com/studio"',
  "process.env.IGNORE_TELEMETRY": "true",
};

const publishEnvs = {
  ...localProdBuildEnvs,
  "process.env.IGNORE_TELEMETRY": "false",
};

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
    : argv.includes("--publish")
      ? publishEnvs
      : localProdBuildEnvs,
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
