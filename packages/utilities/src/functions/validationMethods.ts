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
