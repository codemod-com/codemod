import * as S from "@effect/schema/Schema";

const urlParamsEnvelopeSchema = S.struct({
	urlParams: S.string,
});

export const parseUrlParamsEnvelope = S.parseSync(urlParamsEnvelopeSchema);
