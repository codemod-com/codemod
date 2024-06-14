import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import {
  GetIntentParams,
  GetIntentQuery,
  PopulateIntentQuery,
} from "./schemas";

export function getIntentValidator(
  server: FastifyInstance,
): RouteShorthandOptions {
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

export function populateIntentValidator(
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
