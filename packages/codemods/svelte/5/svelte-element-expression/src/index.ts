import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift; // Access jscodeshift API
  const source = file.source; // Read the file content as text

  if (typeof source !== "string") {
    throw new Error("Expected fileInfo.source to be a string");
  }

  // Regular expression to find <svelte:element this="...">
  const svelteElementRegex =
    /<svelte:element\s+([^>]*?)this="([^"]+)"([^>]*?)>/g;

  // Replace matches with the desired format
  const modifiedSource = source.replace(
    svelteElementRegex,
    (match, before, elementType, after) => {
      return `<svelte:element ${before}this={${JSON.stringify(
        elementType,
      )}}${after}>`;
    },
  );

  return modifiedSource;
}
