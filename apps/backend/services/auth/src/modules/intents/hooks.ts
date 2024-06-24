import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import {
  GetIntentParams,
  GetIntentQuery,
  PopulateIntentQuery,
} from "./schemas";

export function getIntentHooks(server: FastifyInstance): RouteShorthandOptions {
  return {
    preHandler: [
      server.validate({
        params: GetIntentParams,
      }),
      server.validate({
        query: GetIntentQuery,
      }),
    ],
  };
}

export function populateIntentHooks(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: [
      server.validate({
        query: PopulateIntentQuery,
      }),
    ],
  };
}
