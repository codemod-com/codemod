import * as S from "@effect/schema/Schema";

const stateSchema = S.struct({
	engine: S.union(S.literal("jscodeshift"), S.literal("tsmorph")),
	beforeSnippet: S.string,
	afterSnippet: S.string,
	codemodSource: S.string,
});

export type State = S.To<typeof stateSchema>;

export const parseState = S.parseSync(stateSchema);
