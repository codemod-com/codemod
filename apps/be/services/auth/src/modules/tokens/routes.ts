import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import {
  getAppToken,
  getOAuthToken,
  revokeToken,
  validateToken,
} from "./token.controllers";

import { bearerTokenHeadersValidator } from "./token.validators";

export async function tokenRoutes(server: FastifyInstance) {
  server.get(
    "/token/validate",
    bearerTokenHeadersValidator(server),
    validateToken,
  );

  server.get(
    "/token/oauth",
    bearerTokenHeadersValidator(server),
    getOAuthToken,
  );

  server.get("/token/app", bearerTokenHeadersValidator(server), getAppToken);

  server.delete(
    "/token/revoke",
    bearerTokenHeadersValidator(server),
    revokeToken,
  );
}
