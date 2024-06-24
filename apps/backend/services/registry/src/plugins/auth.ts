import type { Organization, User } from "@clerk/backend";
import axios from "axios";
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
  interface FastifyRequest {
    user: User | null;
    organizations: Organization[] | null;
    namespaces: string[] | null;
  }
}

const plugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.decorate("authenticate", async (request: FastifyRequest) => {
    const token = request.headers.authorization;

    if (token) {
      const { data, status } = await axios.get(
        "http://0.0.0.0:8081/token/validate",
        {
          headers: { Authorization: token },
        },
      );

      const { user, organizations, namespaces } = data;

      if (status === 200) {
        request.user = user;
        request.organizations = organizations;
        request.namespaces = namespaces;
      }
    }
  });
};

export const auth = fp(plugin);
