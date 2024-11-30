import type { Organization, User } from "@codemod-com/api-types";
import axios from "axios";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export interface UserDataPopulatedRequest extends FastifyRequest {
  user?: User;
  organizations?: Organization[];
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

export async function getAuthPlugin(authBackendUrl: string) {
  return fp(async (fastify: FastifyInstance, _opts: unknown) => {
    fastify.decorate(
      "authenticate",
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const authHeader = request.headers.authorization;

          if (!authHeader) reply.code(401).send({ error: "Unauthorized" });

          await axios.get(`${authBackendUrl}/verifyToken`, {
            headers: {
              Authorization: authHeader,
            },
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
          organizations?: Organization[];
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

          const { data } = await axios.get(`${authBackendUrl}/userData`, {
            headers: {
              Authorization: authHeader,
            },
          });

          const { user, organizations, allowedNamespaces } = data;

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

          if (!authHeader) reply.code(401).send({ error: "Unauthorized" });

          const { data } = await axios.get(`${authBackendUrl}/oAuthToken`, {
            headers: {
              Authorization: authHeader,
            },
          });

          const { token } = data;

          request.token = token;
        } catch {
          reply.code(401).send({ error: "Unauthorized" });
        }
      },
    );
  });
}
