import type { ApiResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { Widget } from "@codemod-com/database";
import type { FastifyReply, RouteHandler } from "fastify";
import { parsePutWidgetBody } from "#schemata/schema.js";

export type PutWidgetResponse = ApiResponse<Widget>;

export const putWidgetHandler: RouteHandler<{
  Reply: PutWidgetResponse;
}> = async (request: UserDataPopulatedRequest, reply: FastifyReply) => {
  const body = parsePutWidgetBody(request.body);

  try {
    if (body.id) {
      const widget = await prisma.widget
        .update({ where: { id: body.id }, data: body })
        .catch(() => null);

      if (widget === null) {
        return reply.status(400).send({
          // @TODO
          error: "WIDGET_NOT_FOUND",
          errorText: "Widget not found",
        });
      }

      return widget;
    }

    if (!body.kind || !body.kind || !body.insightId) {
      return reply.status(400).send({
        // @TODO
        error: "INVALID_WIDGET",
        errorText: "Invalid widget",
      });
    }

    const widget = await prisma.widget.create({
      data: {
        data: body.data,
        kind: body.kind,
        insight: { connect: { id: body.insightId } },
      },
    });

    return widget;
  } catch (err) {
    return reply.status(400).send({
      // @TODO
      error: "WIDGET_NOT_FOUND",
      errorText: "Widget not found",
    });
  }
};
