import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { Insight, Widget } from "@codemod-com/database";
import type { FastifyReply, RouteHandler } from "fastify";
import * as v from "valibot";

export type GetInsightResponse = ApiResponse<Insight & { widgets: Widget[] }>;

export const getInsightHandler: RouteHandler<{
  Reply: GetInsightResponse;
}> = async (request: UserDataPopulatedRequest, reply: FastifyReply) => {
  const { id } = v.parse(
    v.object({ id: v.pipe(v.string(), v.transform(Number), v.number()) }),
    request.params,
  );

  const insight = await prisma.insight.findFirst({
    where: { id },
    include: {
      widgets: true,
      codemodRuns: { select: { data: true } },
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
