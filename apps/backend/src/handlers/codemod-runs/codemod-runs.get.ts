import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { CodemodRun } from "@codemod-com/database";
import type { RouteHandler } from "fastify";
import { parsePaginatedGetQuery } from "#schemata/schema.js";

export type GetCodemodRunsResponse = ApiResponse<{
  total: number;
  data: CodemodRun[];
}>;

export const getCodemodRunsHandler: RouteHandler<{
  Reply: GetCodemodRunsResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const query = parsePaginatedGetQuery(request.query);

  const userId = request.user?.id;
  const [total, codemodRuns] = await Promise.all([
    prisma.codemodRun.count({
      where: { ownerId: userId },
    }),
    prisma.codemodRun.findMany({
      where: { ownerId: userId },
      take: query.size,
      skip: query.size && query.page ? query.size * (query.page - 1) : 0,
    }),
  ]);

  return {
    total,
    data: codemodRuns,
  };
};
