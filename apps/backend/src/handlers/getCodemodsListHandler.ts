import { randomBytes } from 'node:crypto';
import type { CodemodListResponse } from '@codemod-com/utilities';
import type { CustomHandler } from '../customHandler.js';
import {
	parseClientIdentifierSchema,
	parseListCodemodsQuery,
} from '../schemata/schema.js';
import { ALL_CLAIMS } from '../services/tokenService.js';

export let getCodemodsListHandler: CustomHandler<CodemodListResponse> = async ({
	getAccessToken,
	tokenService,
	codemodService,
	telemetryService,
	getClerkUserData,
	request,
}) => {
	let { search } = parseListCodemodsQuery(request.query);
	let accessToken = getAccessToken();

	let getUserId = async (): Promise<string | null> => {
		if (accessToken === null) {
			return null;
		}

		try {
			return await tokenService.findUserIdMetadataFromToken(
				accessToken,
				BigInt(Date.now()),
				ALL_CLAIMS,
			);
		} catch (err) {
			return null;
		}
	};

	let userId = await getUserId();
	let distinctId = userId ?? randomBytes(16).toString('hex');

	let clientIdentifier = request.headers['x-client-identifier']
		? parseClientIdentifierSchema(request.headers['x-client-identifier'])
		: 'UNKNOWN';

	// we are not interested in events without searchTerm
	if (search !== undefined) {
		telemetryService.sendEvent(
			{
				kind: 'listNames',
				searchTerm: search,
			},
			{
				cloudRole: clientIdentifier,
				distinctId,
			},
		);
	}

	if (userId === null) {
		return codemodService.getCodemodsList(null, search, []);
	}

	let userData = await getClerkUserData(userId);

	return codemodService.getCodemodsList(
		userId,
		search,
		userData?.allowedNamespaces,
	);
};
