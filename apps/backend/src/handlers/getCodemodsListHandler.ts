import type { CodemodListResponse } from "@codemod-com/utilities";
import type { CustomHandler } from "../customHandler.js";
import { parseListCodemodsQuery } from "../schemata/schema.js";
import { ALL_CLAIMS } from "../services/tokenService.js";

export const getCodemodsListHandler: CustomHandler<CodemodListResponse> =
	async ({
		getAccessToken,
		tokenService,
		codemodService,
		getClerkUserData,
		request,
	}) => {
		const { search } = parseListCodemodsQuery(request.query);

		const accessToken = getAccessToken();
		if (accessToken === null) {
			return codemodService.getCodemodsList(null, search, []);
		}

		let userId: string;
		try {
			userId = await tokenService.findUserIdMetadataFromToken(
				accessToken,
				BigInt(Date.now()),
				ALL_CLAIMS,
			);
		} catch (err) {
			return codemodService.getCodemodsList(null, search, []);
		}
		const userData = await getClerkUserData(userId);

		return codemodService.getCodemodsList(
			userId,
			search,
			userData?.allowedNamespaces,
		);
	};
