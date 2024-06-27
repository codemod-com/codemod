import {
  type OrganizationMembership,
  type User,
  extendedFetch,
} from "@codemod-com/utilities";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { environment } from "../util";

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
    getUserData: (
      request: FastifyRequest & UserDataPopulatedRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    getOAuthToken: (
      request: FastifyRequest & OAuthTokenPopulatedRequest,
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
        });
      } catch (error) {
        console.error(error);
        reply.code(401).send({ error: "Unauthorized" });
      }
    },
  );

  fastify.decorate(
    "getUserData",
    async (
      request: FastifyRequest & {
        user?: User;
        organizations?: OrganizationMembership[];
        allowedNamespaces?: string[];
      },
      reply: FastifyReply,
    ) => {
      try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
          request.user = undefined;
          request.organizations = undefined;
          request.allowedNamespaces = undefined;
          return;
        }

        const response = await extendedFetch(
          `${environment.AUTH_SERVICE_URL}/userData`,
          { headers: { Authorization: authHeader } },
        );

        const { user, organizations, allowedNamespaces } =
          (await response.json()) as {
            user?: User;
            organizations?: OrganizationMembership[];
            allowedNamespaces?: string[];
          };

        request.user = user;
        request.organizations = organizations;
        request.allowedNamespaces = allowedNamespaces;
      } catch (error) {
        console.error(error);
        reply.code(401).send({ error: "Unauthorized" });
      }
    },
  );

  fastify.decorate(
    "getOAuthToken",
    async (
      request: FastifyRequest & {
        token?: string;
      },
      reply: FastifyReply,
    ) => {
      try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
          reply.code(401).send({ error: "Unauthorized" });
          return;
        }

        const response = await extendedFetch(
          `${environment.AUTH_SERVICE_URL}/oAuthToken`,
          { headers: { Authorization: authHeader } },
        );

        const { token } = (await response.json()) as { token?: string };

        request.token = token;
      } catch {
        reply.code(401).send({ error: "Unauthorized" });
      }
    },
  );
}

export default fp(authPlugin);
