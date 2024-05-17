import * as t from 'io-ts';
import { buildTypeCodec } from '../utilities';

export let createIssueResponseCodec = buildTypeCodec({
	html_url: t.string,
});

export type CreateIssueResponse = t.TypeOf<typeof createIssueResponseCodec>;
