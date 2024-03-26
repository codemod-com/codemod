import * as t from "io-ts";
import { buildTypeCodec } from "../utilities";

export const codemodEntryCodec = buildTypeCodec({
	kind: t.literal("codemod"),
	hashDigest: t.string,
	name: t.string,
});

export type CodemodEntry = t.TypeOf<typeof codemodEntryCodec>;

export const codemodNamesCodec = buildTypeCodec({
	kind: t.literal("names"),
	names: t.readonlyArray(t.string),
});

export type CodemodNames = t.TypeOf<typeof codemodNamesCodec>;
