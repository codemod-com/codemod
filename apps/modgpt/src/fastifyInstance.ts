import type { FastifyPluginCallback } from "fastify";

export type Instance = Parameters<FastifyPluginCallback>[0];
