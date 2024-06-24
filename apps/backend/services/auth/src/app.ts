import Fastify, {
  type FastifyInstance,
  type FastifyPluginAsync,
  type FastifyPluginOptions,
} from "fastify";

import { clerkPlugin as clerk } from "@clerk/fastify";
import { fastifyCors as cors } from "@fastify/cors";
import { fastifyRateLimit as rateLimit } from "@fastify/rate-limit";

import { clerkOptions } from "./config/clerk";
import { corsOptions } from "./config/cors";
import { rateLimitOptions } from "./config/rate-limit";
import { serverOptions } from "./config/server";

import { gracefulShutdown } from "./utils/graceful-shutdown";

declare module "fastify" {
  export interface FastifyInstance {
    name: string;
    run: () => Promise<void>;
  }
}

type ServerOptions = {
  name: string;
  plugins: Array<{
    plugin: FastifyPluginAsync;
    options?: FastifyPluginOptions;
  }>;
  routes: FastifyPluginAsync[];
};

export const createService = async ({
  name,
  plugins,
  routes,
}: ServerOptions) => {
  const server = Fastify();

  server.decorate("name", name);

  await server.register(clerk, clerkOptions);
  await server.register(cors, corsOptions);
  await server.register(rateLimit, rateLimitOptions);

  for (const { plugin, options } of plugins) {
    await server.register(plugin, options);
  }

  for (const route of routes) {
    await server.register(route);
  }

  server.decorate("run", async function (this: FastifyInstance) {
    const { host, port } = serverOptions;
    try {
      await this.ready();
      await this.listen({ host, port });

      this.log.info(`Server routes: \n${this.printRoutes()}`);

      gracefulShutdown(server);
    } catch (error) {
      this.log.error(`Server start error: ${error}`);
      process.exit(1);
    }
  });

  return server;
};
