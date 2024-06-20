import type { Uri } from 'vscode';
import { buildHash } from '../utilities';
import type { UriHash } from './types';

export let buildUriHash = (uri: Pick<Uri, 'toString'>): UriHash => {
	return buildHash(uri.toString()) as UriHash;
};
