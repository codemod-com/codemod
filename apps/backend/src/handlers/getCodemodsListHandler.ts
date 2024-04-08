import { CustomHandler } from "../customHandler.js";
import { parseListCodemodsQuery } from "../schemata/query.js";
import { ShortCodemodInfo } from "../services/codemodService.js";

export const getCodemodsListHandler: CustomHandler<ShortCodemodInfo[]> = async (
	dependencies,
) => {
	const { search } = parseListCodemodsQuery(dependencies.request.query);

	const userId = await dependencies.getClerkUserId();
	const userData = await dependencies.getClerkUserData(userId);

	return dependencies.codemodService.getCodemodsList(
		userId,
		search,
		userData?.allowedNamespaces,
	);
};
