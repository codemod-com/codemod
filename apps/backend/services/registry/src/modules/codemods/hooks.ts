import type { FastifyInstance, RouteShorthandOptions } from "fastify";

import {
  GetCodemodDownloadLinkQuery,
  GetCodemodParams,
  GetCodemodsListParams,
} from "./schemas";

export function getCodemodHooks(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: server.validate({ params: GetCodemodParams }),
  };
}

export function getCodemodsListHooks(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: [
      server.authenticate,
      server.validate({ params: GetCodemodsListParams }),
    ],
  };
}

export function getCodemodDownloadLinkHooks(
  server: FastifyInstance,
): RouteShorthandOptions {
  return {
    preHandler: [
      server.authenticate,
      server.validate({ query: GetCodemodDownloadLinkQuery }),
    ],
  };
}
