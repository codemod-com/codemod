import { build } from "esbuild";
import { hideBin } from "yargs/helpers";

const prodEnvs = {
  "process.env.NODE_ENV": '"production"',
  "process.env.BACKEND_URL": '"https://backend.codemod.com"',
  "process.env.CODEMOD_HOME_PAGE_URL": '"https://codemod.com"',
  "process.env.CODEMOD_STUDIO_URL": '"https://codemod.com/studio"',
};

const localEnvs = {
  "process.env.NODE_ENV": '"development"',
  "process.env.BACKEND_URL": '"http://localhost:8081"',
  "process.env.CODEMOD_HOME_PAGE_URL": '"http://localhost:3000"',
  "process.env.CODEMOD_STUDIO_URL": '"http://localhost:3000/studio"',
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
  define: argv.includes("--local") ? localEnvs : prodEnvs,
  external: [
    "esbuild",
    "@ast-grep/napi",
    "keytar",
    "prettier",
    // Workaround for @vue/compiler-sfc dynamic require
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
