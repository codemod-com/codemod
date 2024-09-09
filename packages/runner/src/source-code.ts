import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getEntryPath, isJavaScriptName } from "@codemod-com/utilities";
import esbuild from "esbuild";
import { glob } from "glob";

export type TransformFunction = (
  ...args: unknown[]
) => unknown | Promise<unknown>;

type NonDefaultExports = {
  __esModule?: boolean;
  default?: TransformFunction;
  handleSourceFile?: TransformFunction;
  transform?: TransformFunction;
  workflow?: TransformFunction;
  repomod?: TransformFunction;
  filemod?: TransformFunction;
};

export const isESMExtension = (path: string) =>
  path.endsWith(".mjs") || path.endsWith(".mts");

export const temporaryLoadedModules = new Map<
  string,
  TransformFunction | null
>();

export const getTransformer = async (source: string, name?: string) => {
  type Exports = NonDefaultExports | (() => void);

  const hashDigest = createHash("sha256").update(source).digest("hex");
  // CJS
  try {
    const module = { exports: {} as Exports };

    const keys = ["module", "exports", "require"];
    const values = [module, module.exports, require];

    new Function(...keys, source).apply(null, values);

    return typeof module.exports === "function"
      ? module.exports
      : module.exports.__esModule
        ? module.exports.default ??
          module.exports.transform ??
          module.exports.handleSourceFile ??
          module.exports.repomod ??
          module.exports.filemod ??
          module.exports.workflow ??
          null
        : null;
  } catch (err) {
    // ESM
    try {
      const alreadyLoaded = temporaryLoadedModules.get(hashDigest);
      if (alreadyLoaded) return alreadyLoaded;

      const tempFilePath = join(__dirname, `temp-module-${hashDigest}.mjs`);

      await writeFile(tempFilePath, source);
      const module = (await import(
        `file://${tempFilePath}`
      )) as NonDefaultExports;

      const transformer =
        typeof module.default === "function"
          ? module.default
          : module.default ??
            module.transform ??
            module.handleSourceFile ??
            module.repomod ??
            module.filemod ??
            module.workflow ??
            null;

      temporaryLoadedModules.set(hashDigest, transformer);
      return transformer;
    } catch (err) {
      return null;
    }
  }
};

export const DEFAULT_BUILD_PATH = "cdmd_dist/index.js";
export const BUILT_SOURCE_GLOB = "cdmd_dist/index.{js,mjs,cjs}";

export const bundleJS = async (options: {
  entry: string;
  esm?: boolean;
  engine?: string;
}) => {
  const { entry, esm: argvEsm, engine } = options;
  const isESM = isESMExtension(entry) || argvEsm || engine === "workflow";
  const EXTERNAL_DEPENDENCIES = [
    "jscodeshift",
    "ts-morph",
    "@ast-grep/napi",
    "@codemod.com/workflow",
  ];
  const outfile = `/cdmd_dist/index.${isESM ? "mjs" : "cjs"}`;

  const buildOptions: Parameters<typeof esbuild.build>[0] = {
    entryPoints: [entry],
    bundle: true,
    external: EXTERNAL_DEPENDENCIES,
    platform: "node",
    minify: true,
    minifyWhitespace: true,
    format: isESM ? "esm" : "cjs",
    legalComments: "inline",
    outfile,
    write: false, // to the in-memory file system
    logLevel: "error",
    mainFields: isESM ? ["module", "main"] : undefined,
    banner: isESM
      ? {
          js: `
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
`,
        }
      : undefined,
  };

  const { outputFiles } = await esbuild.build(buildOptions);

  const sourceCode =
    outputFiles?.find((file) =>
      file.path.endsWith(outfile.replace(/\.\.\//g, "").replace(/\.\//g, "")),
    )?.text ?? null;

  if (sourceCode === null) {
    throw new Error(`Could not find ${outfile} in output files`);
  }

  return sourceCode;
};

export const getCodemodExecutable = async (
  source: string,
  esm?: boolean,
  engine?: string,
) => {
  const existing = await glob(BUILT_SOURCE_GLOB, {
    cwd: source,
    absolute: true,
  });

  if (existing.length > 0) {
    // biome-ignore lint: it exists
    return await readFile(existing[0]!, { encoding: "utf8" }).catch(() => {
      throw new Error(`Could not read ${existing[0]}`);
    });
  }

  const { path: entryPoint } = await getEntryPath({
    source,
    throwOnNotFound: true,
  });

  if (!isJavaScriptName(entryPoint)) {
    return readFile(entryPoint, { encoding: "utf8" });
  }

  return bundleJS({ entry: entryPoint, esm, engine });
};
