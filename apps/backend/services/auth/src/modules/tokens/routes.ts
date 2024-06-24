import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import {
  getAppToken,
  getOAuthToken,
  revokeToken,
  validateToken,
} from "./controllers";

import { bearerTokenHeadersHooks } from "./hooks";

export async function tokenRoutes(server: FastifyInstance) {
  server.get("/token/validate", bearerTokenHeadersHooks(server), validateToken);

  server.get("/token/oauth", bearerTokenHeadersHooks(server), getOAuthToken);

  server.get("/token/app", bearerTokenHeadersHooks(server), getAppToken);

  server.delete("/token/revoke", bearerTokenHeadersHooks(server), revokeToken);
}
