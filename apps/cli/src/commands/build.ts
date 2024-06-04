import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { PrinterBlueprint } from "@codemod-com/printer";
import {
  isNeitherNullNorUndefined,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import esbuild from "esbuild";
import { glob } from "glob";

// list of packages that should be bundled to the codemod (e.g codemod internal utils)
const EXTERNAL_DEPENDENCIES = ["jscodeshift", "ts-morph", "@ast-grep/napi"];

export const handleBuildCliCommand = async (
  _printer: PrinterBlueprint,
  source: string,
) => {
  const absoluteSource = resolve(source);

  let codemodRcContent: string;
  try {
    codemodRcContent = await readFile(
      resolve(join(absoluteSource, ".codemodrc.json")),
      "utf-8",
    );
  } catch (error) {
    throw new Error(
      `Could not find the .codemodrc.json file in the codemod directory: ${absoluteSource}.`,
    );
  }

  const codemodRc = parseCodemodConfig(JSON.parse(codemodRcContent));

  const entryPointGlob = await glob(
    codemodRc.build?.input ? codemodRc.build.input : "./src/index.{ts,js}",
    { absolute: true, cwd: absoluteSource, nodir: true },
  );

  const entryPoint = entryPointGlob.at(0);
  if (!isNeitherNullNorUndefined(entryPoint)) {
    if (codemodRc.build?.input) {
      throw new Error(
        `Could not find entry point file in ${join(
          absoluteSource,
          codemodRc.build.input,
        )}.\nPlease make sure custom build input path in .codemodrc.json under "build.input" flag is correct and file has the correct permissions.`,
      );
    }

    throw new Error(
      `Could not find the entry point file at ${absoluteSource}/src/index.{js,ts}. Make sure ${absoluteSource}/src/index.{js,ts} exists or specify a custom build input path by adding the "build.input" field to the codemodrc.json file.`,
    );
  }

  try {
    await readFile(entryPoint, "utf-8");
  } catch (error) {
    throw new Error(
      `Could not read entry point file in ${entryPoint}. Please make sure it has the correct permissions.`,
    );
  }

  const outputFilePath = join(
    absoluteSource,
    codemodRc.build?.output ?? "./dist/index.cjs",
  );

  let licenseBuffer: string;

  try {
    licenseBuffer = (await readFile("./LICENSE", "utf8"))
      .replace(/\/\*/gm, "\\/*")
      .replace(/\*\//gm, "*\\/");
  } catch {
    licenseBuffer = "";
  }

  const options: Parameters<typeof esbuild.build>[0] = {
    entryPoints: [entryPoint],
    bundle: true,
    external: EXTERNAL_DEPENDENCIES,
    platform: "node",
    minify: true,
    minifyWhitespace: true,
    format: "cjs",
    legalComments: "inline",
    outfile: outputFilePath,
    write: false, // to the in-memory file system
  };

  const { outputFiles } = await esbuild.build(options);

  const contents =
    outputFiles?.find((file) => file.path === outputFilePath)?.contents ?? null;

  if (contents === null) {
    throw new Error(`Could not find ${outputFilePath} in output files`);
  }

  const buffer = Buffer.concat([
    Buffer.from("/*! @license\n"),
    Buffer.from(licenseBuffer),
    Buffer.from("*/\n"),
    contents,
  ]);

  await mkdir(dirname(outputFilePath), { recursive: true });

  await writeFile(outputFilePath, buffer);

  console.log(
    "The bundled CommonJS contents have been written into %s",
    outputFilePath,
  );

  return {
    outputFilePath,
  };
};
