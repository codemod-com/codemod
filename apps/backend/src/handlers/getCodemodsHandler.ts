import type { Codemod } from "@prisma/client";
import type { CustomHandler } from "../customHandler.js";
import { parseGetCodemodsQuery } from "../schemata/schema.js";

export const getCodemodsHandler: CustomHandler<{
  total: number;
  data: Codemod[];
  page: number;
  size: number;
}> = async (dependencies) => {
  const query = parseGetCodemodsQuery(dependencies.request.query);

  const { search, verified, category, author, framework } = query;

  const page = query.page || 1;
  const size = query.size || 10;

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
