export function isNeitherNullNorUndefined<T>(value: T): value is T & {} {
  return value !== null && value !== undefined;
}
