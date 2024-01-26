import * as S from '@effect/schema/Schema';

export const argumentsSchema = S.array(
	S.union(
		S.struct({
			name: S.string,
			kind: S.literal('string'),
			default: S.optional(S.string),
		}),
		S.struct({
			name: S.string,
			kind: S.literal('number'),
			default: S.optional(S.number),
		}),
		S.struct({
			name: S.string,
			kind: S.literal('boolean'),
			default: S.optional(S.boolean),
		}),
	),
);

export type Arguments = S.To<typeof argumentsSchema>;
