import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { SearchQuery } from "./schemas";

export function searchHook(server: FastifyInstance): RouteShorthandOptions {
  return {
    preHandler: server.validate({
      query: SearchQuery,
    }),
  };
}
