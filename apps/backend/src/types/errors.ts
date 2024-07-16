import {
  CODEMOD_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "@codemod-com/api-types";
import type { FastifyReply } from "fastify";

export const processHandlerError = (
  err: unknown,
  reply: FastifyReply,
  messageOn500?: string,
) => {
  if (err instanceof CodemodNotFoundError) {
    return reply.status(400).send({
      error: CODEMOD_NOT_FOUND,
      errorText: "Codemod not found",
    });
  }

  return reply.status(500).send({
    error: INTERNAL_SERVER_ERROR,
    errorText: messageOn500 ?? String(err),
  });
};
export class CodemodNotFoundError extends Error {}
