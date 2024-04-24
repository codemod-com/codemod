import { object, parse, string } from "valibot";

const urlParamsEnvelopeSchema = object({
	urlParams: string(),
});

export const parseUrlParamsEnvelope = (input: unknown) =>
	parse(urlParamsEnvelopeSchema, input);
