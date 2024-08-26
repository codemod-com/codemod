import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import esbuild from "esbuild";

import { tmpdir } from "node:os";
import { getEntryPath, isJavaScriptName } from "@codemod-com/utilities";

export type TransformFunction = (
  ...args: unknown[]
) => unknown | Promise<unknown>;

type NonDefaultExports = {
  __esModule?: true;
  default?: TransformFunction;
  handleSourceFile?: TransformFunction;
  transform?: TransformFunction;
  workflow?: TransformFunction;
  repomod?: TransformFunction;
  filemod?: TransformFunction;
};

export const getTransformer = async (source: string) => {
  type Exports = NonDefaultExports | (() => void);

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
      const tempDir = tmpdir();
      const tempFilePath = join(tempDir, `temp-module-${Date.now()}.mjs`);

      console.log(source);
      await writeFile(tempFilePath, source);

      // Dynamically import the module from the temporary file and clean up
      const module = (await import(
        `file://${tempFilePath}`
      )) as NonDefaultExports;
      await unlink(tempFilePath);

      return typeof module.default === "function"
        ? module.default
        : module.__esModule
          ? module.default ??
            module.transform ??
            module.handleSourceFile ??
            module.repomod ??
            module.filemod ??
            module.workflow ??
            null
          : null;
    } catch (err) {
      // console.log(err);
      return null;
    }
  }
};

export const BUILT_SOURCE_PATH = "cdmd_dist/index.cjs";

const externalCjsToEsmPlugin = (external: string[]) => ({
  name: "external",
  // biome-ignore lint: its ok
  setup(build: { onResolve: Function; onLoad: Function }) {
    const escapeFun = (text: string) =>
      `^${text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`;
    const filter = new RegExp(external.map(escapeFun).join("|"));
    build.onResolve(
      { filter: /.*/, namespace: "external" },
      (args: { path: string }) => ({
        path: args.path,
        external: true,
      }),
    );
    build.onResolve({ filter }, (args: { path: string }) => ({
      path: args.path,
      namespace: "external",
    }));
    build.onLoad(
      { filter: /.*/, namespace: "external" },
      (args: { path: string }) => ({
        contents: `export * from ${JSON.stringify(args.path)}`,
      }),
    );
  },
});

export const bundleJS = async (options: { entry: string; output?: string }) => {
  const { entry, output = join(dirname(entry), BUILT_SOURCE_PATH) } = options;
  const EXTERNAL_DEPENDENCIES = ["jscodeshift", "ts-morph", "@ast-grep/napi"];

  const buildOptions: Parameters<typeof esbuild.build>[0] = {
    entryPoints: [entry],
    bundle: true,
    // external: EXTERNAL_DEPENDENCIES,
    platform: "node",
    minify: true,
    minifyWhitespace: true,
    format: "esm",
    legalComments: "inline",
    outfile: output,
    write: false, // to the in-memory file system
    logLevel: "error",
    plugins: [externalCjsToEsmPlugin(EXTERNAL_DEPENDENCIES)],
  };

  const { outputFiles } = await esbuild.build(buildOptions);

  const sourceCode =
    outputFiles?.find((file) =>
      file.path.endsWith(output.replace(/\.\.\//g, "").replace(/\.\//g, "")),
    )?.text ?? null;

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
