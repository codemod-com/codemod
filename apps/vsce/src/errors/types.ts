import * as t from 'io-ts';
import { buildTypeCodec } from '../utilities';

export let executionErrorCodec = buildTypeCodec({
	message: t.string,
	path: t.union([t.string, t.undefined]),
});

export type ExecutionError = t.TypeOf<typeof executionErrorCodec>;
