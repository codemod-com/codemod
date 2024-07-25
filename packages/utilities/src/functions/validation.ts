export const isNeitherNullNorUndefined = <T>(
  value: T | null | undefined,
): value is T => value !== undefined && value !== null;

export const assertsNeitherNullOrUndefined = <T>(
  value: T,
): asserts value is T & {} => {
  if (value === null || value === undefined) {
    throw new Error("The value cannot be null or undefined");
  }
};

export const isJavaScriptName = (name: string) =>
  name.endsWith(".ts") ||
  name.endsWith(".js") ||
  name.endsWith(".mjs") ||
  name.endsWith(".cjs") ||
  name.endsWith(".mts") ||
  name.endsWith(".cts");
