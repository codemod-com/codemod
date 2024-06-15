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

export let shareableCodemodSchemata = object({
  v: optional(number()), // version
  e: optional(knownEnginesSchema), // engine
  n: optional(string()), // codemod name
  b: optional(string()), // before snippet
  a: optional(string()), // after snippet
  c: optional(string()), // codemod content
  m: optional(union([literal("learn"), literal("accessTokenRequested")])), // command
});

export let parseShareableCodemod = (input: unknown) =>
  parse(shareableCodemodSchemata, input);

export type ShareableCodemod = Output<typeof shareableCodemodSchemata>;
