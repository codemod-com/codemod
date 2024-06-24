import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { BearerTokenHeaders } from "./schemas";

export function bearerTokenHeadersHooks(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: server.validate({
      headers: BearerTokenHeaders,
    }),
  };
}
