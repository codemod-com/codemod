import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { GetCodemodParams } from "./schemas";

export function getCodemodValidator(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: server.validate({
      params: GetCodemodParams,
    }),
  };
}
