import {
  type OrganizationMembership,
  type User,
  extendedFetch,
} from "@codemod-com/utilities";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { environment } from "../dev-utils/configs";

export interface UserDataPopulatedRequest extends FastifyRequest {
  user?: User;
  organizations?: OrganizationMembership[];
  allowedNamespaces?: string[];
}

export interface OAuthTokenPopulatedRequest extends FastifyRequest {
  token?: string;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

async function authPlugin(fastify: FastifyInstance, _opts: unknown) {
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
          reply.code(401).send({ error: "Unauthorized" });
          return;
        }

        await extendedFetch(`${environment.AUTH_SERVICE_URL}/verifyToken`, {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(5000),
        });
      } catch (error) {
        console.log(error);
      }
    },
  );
}

export default fp(authPlugin);
