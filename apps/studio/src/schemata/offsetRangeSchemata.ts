import * as S from '@effect/schema/Schema';

export const offsetRangeSchema = S.struct({
	start: S.number,
	end: S.number,
});

export type OffsetRange = S.To<typeof offsetRangeSchema>;
