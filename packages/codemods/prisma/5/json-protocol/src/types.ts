import type { JSCodeshift } from "jscodeshift";

export type Dependencies = Readonly<{
  jscodeshift: JSCodeshift;
  j: JSCodeshift;
}>;

export type Options = Readonly<{
  pairs: Record<string, { type: string; name: string }[]>;
}>;
