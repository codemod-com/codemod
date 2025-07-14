import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { isPromise } from "node:util/types";
import { isMainThread } from "node:worker_threads";
import { Lang, parse } from "@ast-grep/napi";
import type { SgRoot } from "@ast-grep/napi";

/**
 * Default patterns to exclude from processing.
 * These patterns typically include directories like node_modules and .git.
 */
const DEFAULT_EXCLUDE = ["**/node_modules/**", "**/.git/**"];

/**
 * Register a codemod transformation.
 * This function is intended to be called in the main thread.
 * It processes files or directories specified in the command line arguments,
 * applies the provided transformation function to the AST of each file,
 * and writes the transformed content back to the file.
 *
 * @param transform Function to transform the AST root.
 * It can either return a string or a Promise that resolves to a string.
 * @param language
 * The programming language of the files to be processed.
 */
export function registerCodemod(
  transform: ((root: SgRoot) => Promise<string>) | ((root: SgRoot) => string),
  language: string,
) {
  if (!isMainThread) return; // break the function if not in the main thread

  const astGrepLang = Lang[language as keyof typeof Lang];

  if (!astGrepLang) throw new Error(`Unsupported language: ${language}`);

  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      // what should we process
      input: {
        type: "string",
      },
      // what should we exclude
      exclude: {
        type: "string",
      },
    },
    allowPositionals: true,
  });

  if (!values.input)
    throw new Error("Input file or directory path is required.");

  const files = fs.globSync(values.input, {
    exclude: values.exclude ? [values.exclude] : DEFAULT_EXCLUDE,
  });

  for (const file of files) {
    const filePath = path.resolve(file);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const root = parse(astGrepLang, content);
    const result = transform(root);

    if (isPromise(result)) {
      result
        .then((transformedContent) => {
          fs.writeFileSync(filePath, transformedContent, "utf-8");
          console.log(`Processed file: ${filePath}`);
        })
        .catch((err) => {
          console.error(`Error processing file ${filePath}:`, err);
        });
    } else {
      fs.writeFileSync(filePath, result, "utf-8");
      console.log(`Processed file: ${filePath}`);
    }
  }
}
