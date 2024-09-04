import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { Insight } from "@codemod-com/database";
import {
  type CodemodRunResponse,
  parsePutInsightBody,
} from "@codemod-com/utilities";
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

export type PutInsightResponse = ApiResponse<Insight>;

export const putInsightHandler: RouteHandler<{
  Reply: PutInsightResponse;
}> = async (request: UserDataPopulatedRequest, reply: FastifyReply) => {
  // try
  const body = parsePutInsightBody(request.body);
  // return reply.status(400).send({
  //   // @TODO
  //   error: "INVALID_INSIGHT",
  //   errorText: "Invalid insight",
  // });

  try {
    if ("id" in body) {
      const insight = await prisma.insight
        .update({ where: { id: body.id }, data: body })
        .catch(() => null);

      if (body.repoUrls.length > 0) {
        await Promise.all(
          body.repoUrls.map(async (repoUrl) => {
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

            const { data } = response;

            for (const codemodRunResult of data) {
              await prisma.codemodRun.update({
                where: { jobId: codemodRunResult.jobId },
                data: {
                  insight: { connect: { id: body.id } },
                },
              });
            }
          }),
        );
      }

      if (insight === null) {
        return reply.status(400).send({
          // @TODO
          error: "INSIGHT_NOT_FOUND",
          errorText: "Insight not found",
        });
      }

      return insight;
    }

    const insight = await prisma.insight.create({
      data: {
        ownerId: request.user!.id,
        repoUrls: body.repoUrls,
      },
    });

    await Promise.all(
      body.repoUrls.map(async (repoUrl) => {
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
  } catch (err) {
    return reply.status(400).send({
      // @TODO
      error: "INSIGHT_NOT_FOUND",
      errorText: "Insight not found",
    });
  }
};
