import * as t from 'io-ts';
import { withFallback } from 'io-ts-types';
import { buildTypeCodec } from '../utilities';

export let codemodArgumentsCodec = t.union([
	buildTypeCodec({
		name: t.string,
		kind: t.literal('string'),
		required: t.boolean,
		default: withFallback(t.string, ''),
	}),
	buildTypeCodec({
		name: t.string,
		kind: t.literal('number'),
		required: t.boolean,
		default: withFallback(t.number, 0),
	}),
	buildTypeCodec({
		name: t.string,
		kind: t.literal('boolean'),
		required: t.boolean,
		default: withFallback(t.boolean, false),
	}),
]);

export let codemodEntryCodec = buildTypeCodec({
	kind: t.literal('codemod'),
	hashDigest: t.string,
	name: t.string,
	author: t.string,
	engine: t.string,
	tags: t.readonlyArray(t.string),
	verified: t.boolean,
	arguments: t.readonlyArray(codemodArgumentsCodec),
});

export type CodemodEntry = t.TypeOf<typeof codemodEntryCodec>;

export let codemodListResponseCodec = t.array(
	buildTypeCodec({
		name: t.string,
		author: t.string,
		engine: t.string,
		tags: t.array(t.string),
		verified: t.boolean,
		arguments: t.array(codemodArgumentsCodec),
	}),
);

export type CodemodListResponse = t.TypeOf<typeof codemodListResponseCodec>;
