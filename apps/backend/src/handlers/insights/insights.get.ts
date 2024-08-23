import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { Insight } from "@codemod-com/database";
import type { RouteHandler } from "fastify";
import { parsePaginatedGetQuery } from "#schemata/schema.js";

export type GetInsightsResponse = ApiResponse<{
  total: number;
  data: (Omit<Insight, "ownerId"> & { loading: boolean })[];
}>;

export const getInsightsHandler: RouteHandler<{
  Reply: GetInsightsResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const query = parsePaginatedGetQuery(request.query);

  const insights = await prisma.insight.findMany({
    include: { codemodRuns: { select: { data: true } } },
    take: query.size,
    skip: query.size && query.page ? query.size * (query.page - 1) : 0,
  });

  return {
    total: 450,
    data: insights.map((insight) => {
      return {
        ...insight,
        loading: insight.codemodRuns.some(
          (run) => run.data.status === "progress",
        ),
      };
    }),
  };
};
