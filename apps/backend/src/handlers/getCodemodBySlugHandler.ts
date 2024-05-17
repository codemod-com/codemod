import type { Codemod } from '@prisma/client';
import type { CustomHandler } from '../customHandler.js';
import { parseGetCodemodBySlugParams } from '../schemata/schema.js';

export let getCodemodBySlugHandler: CustomHandler<Codemod> = async (
	dependencies,
) => {
	let { slug } = parseGetCodemodBySlugParams(dependencies.request.params);

	return dependencies.codemodService.getCodemodBySlug(slug);
};
