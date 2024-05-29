import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { buildTypeCodec } from "../utilities";

export const codemodArgumentsCodec = t.union([
  buildTypeCodec({
    name: t.string,
    kind: t.literal("string"),
    required: t.boolean,
    default: withFallback(t.string, ""),
  }),
  buildTypeCodec({
    name: t.string,
    kind: t.literal("number"),
    required: t.boolean,
    default: withFallback(t.number, 0),
  }),
  buildTypeCodec({
    name: t.string,
    kind: t.literal("boolean"),
    required: t.boolean,
    default: withFallback(t.boolean, false),
  }),
  buildTypeCodec({
    name: t.string,
    kind: t.literal("enum"),
    options: t.array(t.string),
    required: t.boolean,
    default: withFallback(t.array(t.string), [
      "boolean",
      "string",
      "number",
      "JSON",
    ]),
  }),
]);

export const codemodEntryCodec = buildTypeCodec({
  kind: t.literal("codemod"),
  hashDigest: t.string,
  name: t.string,
  author: t.string,
  engine: t.string,
  tags: t.readonlyArray(t.string),
  verified: t.boolean,
  arguments: t.readonlyArray(codemodArgumentsCodec),
});

export type CodemodEntry = t.TypeOf<typeof codemodEntryCodec>;

export const codemodListResponseCodec = t.array(
  buildTypeCodec({
    name: t.string,
    author: t.string,
    engine: t.string,
    tags: t.array(t.string),
    verified: t.boolean,
    arguments: t.array(codemodArgumentsCodec),
  }),
);

export type CodemodListResponse = t.TypeOf<typeof codemodListResponseCodec>;
