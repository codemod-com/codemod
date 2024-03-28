import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { CustomHandler } from "../customHandler.js";
import { parseListCodemodsQuery } from "../schemata/query.js";
import { ShortCodemodInfo } from "../services/codemodService.js";
import { CLAIM_ISSUE_CREATION } from "../services/tokenService.js";
import { environment, getCustomAccessToken } from "../util.js";

export const getCodemodsListHandler: CustomHandler<ShortCodemodInfo[]> = async (
	dependencies,
) => {
	const { search } = parseListCodemodsQuery(dependencies.getRequest()?.query);

	const accessToken = getCustomAccessToken(
		environment,
		dependencies.getRequest()?.headers,
	);

	let userId: string | null = null;
	if (isNeitherNullNorUndefined(accessToken)) {
		userId = await dependencies.tokenService.findUserIdMetadataFromToken(
			accessToken,
			BigInt(Date.now()),
			CLAIM_ISSUE_CREATION,
		);
	}

	return dependencies.codemodService.getCodemodsList(userId, search);
};
