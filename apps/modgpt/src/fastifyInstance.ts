import Fastify, { type FastifyPluginCallback } from "fastify";

export const fastify = Fastify({
  logger: true,
});
export type Instance = Parameters<FastifyPluginCallback>[0];
