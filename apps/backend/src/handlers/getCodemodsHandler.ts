import type { Codemod } from '@prisma/client';
import type { CustomHandler } from '../customHandler.js';
import { parseGetCodemodsQuery } from '../schemata/schema.js';

export let getCodemodsHandler: CustomHandler<{
	total: number;
	data: Codemod[];
	page: number;
	size: number;
}> = async (dependencies) => {
	let query = parseGetCodemodsQuery(dependencies.request.query);

	let { search, verified, category, author, framework } = query;

	let size = query.size || 30;
	let page = query.page || 1;

	return dependencies.codemodService.getCodemods(
		search,
		category,
		author,
		framework,
		verified,
		page,
		size,
	);
};
