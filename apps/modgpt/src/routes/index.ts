import type { FastifyPluginCallback } from 'fastify';
import { corsDisableHeaders } from '../dev-utils/cors';
import { getRootPath } from './root';
import { getSendChatPath } from './sendChat';
import { getVersionPath } from './version';

export let publicRoutes: FastifyPluginCallback = (instance, _opts, done) => {
	[getRootPath, getVersionPath].forEach((f) => f(instance));
	instance.options('/sendChat', (request, reply) => {
		reply.status(204).headers(corsDisableHeaders).send();
	});

	done();
};

export let protectedRoutes: FastifyPluginCallback = (instance, _opts, done) => {
	getSendChatPath(instance);
	done();
};
