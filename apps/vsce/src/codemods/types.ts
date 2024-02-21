import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { buildTypeCodec } from "../utilities";

export const argumentsCodec = t.union([
	t.readonlyArray(
		t.union([
			buildTypeCodec({
				name: t.string,
				kind: t.literal("string"),
				default: t.union([t.string, t.undefined]),
				description: withFallback(t.string, ""),
				required: withFallback(t.boolean, false),
			}),
			buildTypeCodec({
				name: t.string,
				kind: t.literal("number"),
				default: t.union([t.number, t.undefined]),
				description: withFallback(t.string, ""),
				required: withFallback(t.boolean, false),
			}),
			buildTypeCodec({
				name: t.string,
				kind: t.literal("boolean"),
				default: t.union([t.boolean, t.undefined]),
				description: withFallback(t.string, ""),
				required: withFallback(t.boolean, false),
			}),
		]),
	),
	t.undefined,
]);

export const codemodEntryCodec = t.union([
	buildTypeCodec({
		kind: t.literal("codemod"),
		hashDigest: t.string,
		name: t.string,
		engine: t.union([
			t.literal("jscodeshift"),
			t.literal("ts-morph"),
			t.literal("repomod-engine"),
			t.literal("filemod"),
			t.literal("recipe"),
		]),
		arguments: argumentsCodec,
	}),
	buildTypeCodec({
		kind: t.literal("piranhaRule"),
		hashDigest: t.string,
		name: t.string,
		// TODO migrate to @effect/schema once all the codecs are migrated
		language: t.union([
			t.literal("java"),
			t.literal("kt"),
			t.literal("go"),
			t.literal("py"),
			t.literal("swift"),
			t.literal("ts"),
			t.literal("tsx"),
			t.literal("scala"),
		]),
		arguments: argumentsCodec,
	}),
]);

export const privateCodemodEntryCodec = buildTypeCodec({
	kind: t.literal("codemod"),
	hashDigest: t.string,
	name: t.string,
	engine: t.union([
		t.literal("jscodeshift"),
		t.literal("ts-morph"),
		t.literal("repomod-engine"),
		t.literal("filemod"),
		t.literal("recipe"),
	]),
	permalink: t.union([t.string, t.null]),
});

export type CodemodEntry = t.TypeOf<typeof codemodEntryCodec>;

export const codemodNamesCodec = buildTypeCodec({
	kind: t.literal("names"),
	names: t.readonlyArray(t.string),
});

export type Arguments = t.TypeOf<typeof argumentsCodec>;
export type CodemodNames = t.TypeOf<typeof codemodNamesCodec>;
export type PrivateCodemodEntry = t.TypeOf<typeof privateCodemodEntryCodec>;
