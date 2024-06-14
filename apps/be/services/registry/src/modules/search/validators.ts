import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { SearchQuery } from "./schemas";

export function searchValidator(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: server.validate({
      query: SearchQuery,
    }),
  };
}
