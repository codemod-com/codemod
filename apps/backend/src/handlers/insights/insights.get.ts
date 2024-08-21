import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { Insight } from "@codemod-com/database";
import type { RouteHandler } from "fastify";

export type GetInsightsResponse = ApiResponse<{
  total: number;
  data: Insight[];
}>;

export const getInsightsHandler: RouteHandler<{
  Reply: GetInsightsResponse;
}> = async (request: UserDataPopulatedRequest) => {
  // const query = parseGetCodemodsQuery(request.query);

  // const { search, verified, category, author, framework } = query;

  // const size = query.size || 30;
  // const page = query.page || 1;

  return {
    total: 450,
    data: await prisma.insight.findMany({
      where: {
        // search,
        // category,
        // author,
        // framework,
        // verified,
        // page,
        // size,
        // whitelisted: request.allowedNamespaces ?? [],
      },
    }),
  };
};
