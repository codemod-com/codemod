import axios from "axios";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    authenticateCLI: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    getUserData: (
      request: FastifyRequest,
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

        await axios.get(`http://localhost:8080/verifyClientToken`, {
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
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authHeader = request.headers.authorization;

        if (!authHeader) reply.code(401).send({ error: "Unauthorized" });

        const { data } = await axios.get(`http://localhost:8080/userData`, {
          headers: {
            Authorization: authHeader,
          },
        });

        const { user, organizations, allowedNamespaces } = data;

        request.user = user;
        request.organizations = organizations;
        request.allowedNamespaces = allowedNamespaces;
      } catch {
        reply.code(401).send({ error: "Unauthorized" });
      }
    },
  );
}

export default fp(authPlugin);
