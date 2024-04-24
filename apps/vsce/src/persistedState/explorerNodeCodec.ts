import * as t from "io-ts";
import { jobHashCodec } from "../jobs/types";
import { buildTypeCodec } from "../utilities";

interface ExplorerNodeHashDigestBrand {
  readonly __ExplorerNodeHashDigest: unique symbol;
}

export const _explorerNodeHashDigestCodec = t.brand(
  t.string,
  (hashDigest): hashDigest is t.Branded<string, ExplorerNodeHashDigestBrand> =>
    hashDigest.length > 0,
  "__ExplorerNodeHashDigest",
);

export type _ExplorerNodeHashDigest = t.TypeOf<
  typeof _explorerNodeHashDigestCodec
>;

export const _explorerNodeCodec = t.union([
  buildTypeCodec({
    hashDigest: _explorerNodeHashDigestCodec,
    kind: t.literal("ROOT"),
    label: t.string,
    depth: t.number,
    childCount: t.number,
  }),
  buildTypeCodec({
    hashDigest: _explorerNodeHashDigestCodec,
    kind: t.literal("DIRECTORY"),
    path: t.string,
    label: t.string,
    depth: t.number,
    childCount: t.number,
  }),
  buildTypeCodec({
    hashDigest: _explorerNodeHashDigestCodec,
    kind: t.literal("FILE"),
    path: t.string,
    label: t.string,
    depth: t.number,
    jobHash: jobHashCodec,
    fileAdded: t.boolean,
  }),
]);

export type _ExplorerNode = t.TypeOf<typeof _explorerNodeCodec>;
