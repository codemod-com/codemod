import * as S from "@effect/schema/Schema";

export const fileSchema = S.struct({
	hashDigest: S.string,
	name: S.string,
	content: S.string,
	parent: S.union(S.string, S.null),
});

const stateSchema = S.struct({
	engine: S.union(S.literal("jscodeshift"), S.literal("tsmorph")),
	codemodSource: S.string,
	files: S.array(fileSchema),
});

export type State = S.To<typeof stateSchema>;

export const parseState = S.parseSync(stateSchema);
