import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import type { Codemod } from "@codemod-com/database";
import type { RouteHandler } from "fastify";
import { parseGetCodemodsQuery } from "../schemata/schema.js";
import { codemodService } from "../services/CodemodService.js";

export type GetCodemodsResponse = ApiResponse<{
  total: number;
  data: Codemod[];
  page: number;
  size: number;
}>;

export const getCodemodsHandler: RouteHandler<{
  Reply: GetCodemodsResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const query = parseGetCodemodsQuery(request.query);

  const { search, verified, category, author, framework } = query;

  const size = query.size || 30;
  const page = query.page || 1;

  return codemodService.getCodemods({
    search,
    category,
    author,
    framework,
    verified,
    page,
    size,
    whitelisted: request.allowedNamespaces ?? [],
  });
};
