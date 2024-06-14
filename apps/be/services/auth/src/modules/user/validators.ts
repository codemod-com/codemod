import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { BearerTokenHeaders } from "./user.schemas";

export function bearerTokenHeadersValidator(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: server.validate({
      headers: BearerTokenHeaders,
    }),
  };
}
