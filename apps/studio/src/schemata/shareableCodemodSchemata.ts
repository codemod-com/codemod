/* eslint-disable import/group-exports */
import * as S from "@effect/schema/Schema";

export const shareableCodemodSchemata = S.struct({
	v: S.optional(S.number), // version
	e: S.optional(S.union(S.literal("jscodeshift"), S.literal("tsmorph"))), // engine
	n: S.optional(S.string), // codemod name
	b: S.optional(S.string), // before snippet
	a: S.optional(S.string), // after snippet
	c: S.optional(S.string), // codemod content
	m: S.optional(S.union(S.literal("learn"), S.literal("accessTokenRequested"))), // command
});

export const parseShareableCodemod = S.parseSync(shareableCodemodSchemata);

export type ShareableCodemod = S.To<typeof shareableCodemodSchemata>;
