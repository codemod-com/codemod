import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { buildTypeCodec } from "../utilities";

export interface CaseHashBrand {
  readonly __CaseHash: unique symbol;
}

export const caseHashCodec = t.brand(
  t.string,
  (hashDigest): hashDigest is t.Branded<string, CaseHashBrand> =>
    hashDigest.length > 0,
  "__CaseHash",
);

export type CaseHash = t.TypeOf<typeof caseHashCodec>;

export const caseCodec = buildTypeCodec({
  hash: caseHashCodec,
  codemodName: t.string, // deprecated
  codemodHashDigest: withFallback(t.union([t.string, t.undefined]), undefined),
  createdAt: t.number,
  path: t.string,
});

export type Case = t.TypeOf<typeof caseCodec>;
