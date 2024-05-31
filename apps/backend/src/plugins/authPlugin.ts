import type { OrganizationMembership, User } from "@clerk/backend";
import axios from "axios";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { environment } from "../util";

declare module "fastify" {
  interface FastifyInstance {
    authenticateCLI: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    getUserData: (
      request: FastifyRequest & {
        user?: User;
        organizations?: OrganizationMembership[];
        allowedNamespaces?: string[];
      },
      reply: FastifyReply,
    ) => Promise<void>;
    getOAuthToken: (
      request: FastifyRequest & {
        token?: string;
      },
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

async function authPlugin(fastify: FastifyInstance, _opts: unknown) {
  fastify.decorate(
    "authenticateCLI",
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

        if (!authHeader) reply.code(401).send({ error: "Unauthorized" });

        const { data } = await axios.get(
          `${environment.AUTH_SERVICE_URL}/userData`,
          {
            headers: {
              Authorization: authHeader,
            },
          },
        );

        const { user, organizations, allowedNamespaces } = data;

        request.user = user;
        request.organizations = organizations;
        request.allowedNamespaces = allowedNamespaces;
      } catch {
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

        const { data } = await axios.get(
          `${environment.AUTH_SERVICE_URL}/oAuthToken`,
          {
            headers: {
              Authorization: authHeader,
            },
          },
        );

        const { token } = data;

        request.token = token;
      } catch {
        reply.code(401).send({ error: "Unauthorized" });
      }
    },
  );
}

export default fp(authPlugin);
