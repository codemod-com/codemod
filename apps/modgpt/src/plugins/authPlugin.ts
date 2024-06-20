import type { OrganizationMembership, User } from "@codemod-com/utilities";
import axios from "axios";
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

        if (!authHeader) reply.code(401).send({ error: "Unauthorized" });

        await axios.get(`${environment.AUTH_SERVICE_URL}/verifyClientToken`, {
          headers: {
            Authorization: authHeader,
          },
        });
      } catch {
        reply.code(401).send({ error: "Unauthorized" });
      }
    },
  );
}

export default fp(authPlugin);
