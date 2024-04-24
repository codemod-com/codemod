export type ToVoid<T = unknown> = (x: T) => void;
export type Void = () => void;
export type Repeat<
  T,
  N extends number,
  R extends unknown[] = [],
> = R["length"] extends N ? R : Repeat<T, N, [T, ...R]>;
type ValueOf<T> = T[keyof T];
