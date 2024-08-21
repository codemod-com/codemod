import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { Insight, Widget } from "@codemod-com/database";
import type { FastifyReply, RouteHandler } from "fastify";

export type GetInsightResponse = ApiResponse<Insight & { widgets: Widget[] }>;

export const getInsightHandler: RouteHandler<{
  Reply: GetInsightResponse;
}> = async (request: UserDataPopulatedRequest, reply: FastifyReply) => {
  // const query = parseGetCodemodsQuery(request.query);

  // const { search, verified, category, author, framework } = query;

  // const size = query.size || 30;
  // const page = query.page || 1;

  const insight = await prisma.insight.findFirst({
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
    include: {
      widgets: true,
    },
  });

  if (!insight) {
    return reply.status(400).send({
      // @TODO
      error: "INSIGHT_NOT_FOUND",
      errorText: "Insight not found",
    });
  }

  return insight;
};
