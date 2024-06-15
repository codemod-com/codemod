import { object, parse, string } from 'valibot';

let urlParamsEnvelopeSchema = object({
	urlParams: string(),
});

export let parseUrlParamsEnvelope = (input: unknown) =>
	parse(urlParamsEnvelopeSchema, input);
