import * as t from "io-ts";
import { buildTypeCodec } from "../utilities";

export const codemodEntryCodec = buildTypeCodec({
	kind: t.literal("codemod"),
	hashDigest: t.string,
	name: t.string,
});

export type CodemodEntry = t.TypeOf<typeof codemodEntryCodec>;

const codemodCodec = buildTypeCodec({
	name: t.string,
	author: t.string,
	engine: t.array(t.string),
	tags: t.array(t.string),
	verified: t.boolean,
	arguments: t.array(t.any), // TODO: Create a type for arguments
});

export const codemodNamesCodec = buildTypeCodec({
	kind: t.literal("codemodList"),
	codemods: t.array(codemodCodec),
});

export type CodemodNames = t.TypeOf<typeof codemodNamesCodec>;
