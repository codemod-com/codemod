import type { RouteHandler } from "fastify";
import { codemodService } from "~/services/CodemodService";
import type { Codemod } from "../../prisma/client";
import { parseGetCodemodsQuery } from "../schemata/schema.js";

export const getCodemodsHandler: RouteHandler<{
  Reply: {
    total: number;
    data: Codemod[];
    page: number;
    size: number;
  };
}> = async (request, reply) => {
  const query = parseGetCodemodsQuery(request.query);

  const { search, verified, category, author, framework } = query;

  const size = query.size || 30;
  const page = query.page || 1;

  return codemodService.getCodemods(
    search,
    category,
    author,
    framework,
    verified,
    page,
    size,
  );
};
