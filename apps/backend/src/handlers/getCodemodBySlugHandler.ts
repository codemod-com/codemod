import { Codemod } from "@prisma/client";
import { CustomHandler } from "../customHandler.js";
import { parseGetCodemodBySlugParams } from "../schemata/schema.js";

export const getCodemodBySlugHandler: CustomHandler<Codemod> = async (
	dependencies,
) => {
	const { slug } = parseGetCodemodBySlugParams(dependencies.request.params);

	return dependencies.codemodService.getCodemodBySlug(slug);
};
