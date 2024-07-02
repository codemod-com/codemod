export const isNil = <T>(x: T | undefined | null): x is undefined | null =>
  x === undefined || x === null;
