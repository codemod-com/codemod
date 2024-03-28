import { Codemod } from "@prisma/client";
import { CustomHandler } from "../customHandler.js";
import { parseGetCodemodBySlugParams } from "../schemata/query.js";

export const getCodemodBySlugHandler: CustomHandler<Codemod> = async (
	dependencies,
) => {
	const { slug } = parseGetCodemodBySlugParams(
		dependencies.getRequest()?.params,
	);

	return dependencies.codemodService.getCodemodBySlug(slug);
};
