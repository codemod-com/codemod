import type { ApiResponse, CodemodRunResponse } from "@codemod-com/api-types";
import { parsePostInsightBody } from "@codemod-com/api-types/src/insights.js";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { type Insight, prisma } from "@codemod-com/database";
import axios from "axios";
import type { FastifyReply, RouteHandler } from "fastify";
import { environment } from "#util.js";

const DEFAULT_CODEMODS = [
  {
    engine: "workflow",
    name: "drift_analyzer",
  },
  {
    engine: "workflow",
    name: "drift_analyzer_pkg",
  },
];

export type PostNewInsightResponse = ApiResponse<Insight>;

export const postNewInsightHandler: RouteHandler<{
  Reply: PostNewInsightResponse;
}> = async (request: UserDataPopulatedRequest, reply: FastifyReply) => {
  const { repoUrls } = parsePostInsightBody(request.body);

  const insight = await prisma.insight.create({
    data: {
      ownerId: request.user!.id,
      repoUrls,
    },
  });

  await Promise.all(
    repoUrls.map(async (repoUrl) => {
      const { data: response } = await axios.post<CodemodRunResponse>(
        `${environment.RUN_SERVICE_URL}/codemodRun`,
        {
          repoUrl,
          codemods: DEFAULT_CODEMODS,
        },
        {
          headers: {
            Authorization: request.headers?.authorization,
          },
        },
      );

      console.dir({ response }, { depth: 8 });

      const { data } = response;

      for (const codemodRunResult of data) {
        await prisma.codemodRun.update({
          where: { jobId: codemodRunResult.jobId },
          data: {
            insight: { connect: { id: insight.id } },
          },
        });
      }
    }),
  );

  return insight;
};
