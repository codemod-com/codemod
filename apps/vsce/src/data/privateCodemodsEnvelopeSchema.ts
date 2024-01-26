import * as S from '@effect/schema/Schema';

const privateCodemodsEnvelopeSchema = S.struct({
	names: S.array(S.string),
});

export const parsePrivateCodemodsEnvelope = S.parseSync(
	privateCodemodsEnvelopeSchema,
);
