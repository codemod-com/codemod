import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
} from "fastify";

import type { AuthObject } from "@clerk/backend/internal";
import { type ClerkFastifyOptions, clerkPlugin, getAuth } from "@clerk/fastify";

import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    getAuth: (request: FastifyRequest) => AuthObject;
  }
  export interface FastifyRequest {
    auth: AuthObject;
  }
}

const plugin: FastifyPluginAsync = async (
  server: FastifyInstance,
  options: ClerkFastifyOptions,
) => {
  server.register(clerkPlugin, options);
  server.addHook("onRequest", async (request: FastifyRequest) => {
    request.auth = getAuth(request);
  });
};

export const clerk = fp(plugin);
