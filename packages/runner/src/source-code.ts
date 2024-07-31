import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import esbuild from "esbuild";

import { getEntryPath, isJavaScriptName } from "@codemod-com/utilities";

export type TransformFunction = (
  ...args: unknown[]
) => unknown | Promise<unknown>;

export const getTransformer = (source: string) => {
  type Exports =
    | {
        __esModule?: true;
        default?: TransformFunction;
        handleSourceFile?: TransformFunction;
        transform?: TransformFunction;
        workflow?: TransformFunction;
        repomod?: TransformFunction;
        filemod?: TransformFunction;
      }
    | (() => void);

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
};

export const BUILT_SOURCE_PATH = "cdmd_dist/index.cjs";

export const bundleJS = async (options: {
  entry: string;
  output?: string;
}) => {
  const { entry, output = join(dirname(entry), BUILT_SOURCE_PATH) } = options;
  const EXTERNAL_DEPENDENCIES = ["jscodeshift", "ts-morph", "@ast-grep/napi"];

  const buildOptions: Parameters<typeof esbuild.build>[0] = {
    entryPoints: [entry],
    bundle: true,
    external: EXTERNAL_DEPENDENCIES,
    platform: "node",
    minify: true,
    minifyWhitespace: true,
    format: "cjs",
    legalComments: "inline",
    outfile: output,
    write: false, // to the in-memory file system
    logLevel: "error",
  };

  const { outputFiles } = await esbuild.build(buildOptions);

  const sourceCode =
    outputFiles?.find((file) => file.path.endsWith(output))?.text ?? null;

  if (sourceCode === null) {
    throw new Error(`Could not find ${output} in output files`);
  }

  return sourceCode;
};

export const getCodemodExecutable = async (source: string, write?: boolean) => {
  const outputFilePath = join(resolve(source), BUILT_SOURCE_PATH);
  try {
    return await readFile(outputFilePath, { encoding: "utf8" });
  } catch {
    // continue
  }

  const { path: entryPoint } = await getEntryPath({
    source,
    throwOnNotFound: true,
  });

  if (!isJavaScriptName(entryPoint)) {
    return readFile(entryPoint, { encoding: "utf8" });
  }

  const bundledCode = await bundleJS({
    entry: entryPoint,
    output: outputFilePath,
  });

  if (write) {
    await mkdir(dirname(outputFilePath), { recursive: true });
    await writeFile(outputFilePath, bundledCode);
  }

  return bundledCode;
};
