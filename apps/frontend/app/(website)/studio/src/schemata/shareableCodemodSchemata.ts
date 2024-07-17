import { knownEnginesSchema } from "@codemod-com/utilities";
import {
  type Output,
  literal,
  number,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";

export const shareableCodemodSchemata = object({
  v: optional(number()), // version
  e: optional(knownEnginesSchema), // engine
  n: optional(string()), // codemod name
  b: optional(string()), // before snippet
  a: optional(string()), // after snippet
  bm: optional(string()), // multiple before snippets
  am: optional(string()), // multiple after snippets
  nm: optional(string()), // snippets names
  c: optional(string()), // codemod content
  m: optional(union([literal("learn"), literal("accessTokenRequested")])), // command
});

export const parseShareableCodemod = (input: unknown) =>
  parse(shareableCodemodSchemata, input);

export type ShareableCodemod = Output<typeof shareableCodemodSchemata>;
