import Fastify, { type FastifyPluginCallback } from 'fastify';

export let fastify = Fastify({
	logger: true,
});
export type Instance = Parameters<FastifyPluginCallback>[0];
