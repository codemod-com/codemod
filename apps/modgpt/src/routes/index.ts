import { clerkPlugin } from '@clerk/fastify';
import Fastify, {
	type FastifyInstance,
	type FastifyPluginCallback,
} from 'fastify';
import {
	areClerkKeysSet,
	environment,
	isDevelopment,
} from '../dev-utils/configs';
import { fastify } from '../fastifyInstance';
import { getRootPath } from './root';
import { getSendChatPath } from './sendChat';
import { getVersionPath } from './version';

let noop = (x: unknown) => undefined;
export let publicRoutes: FastifyPluginCallback = (instance, _opts, done) => {
	[
		getRootPath,
		getVersionPath,
		isDevelopment ? getSendChatPath : noop,
	].forEach((f) => f(fastify));

	done();
};

export let protectedRoutes: FastifyPluginCallback = (instance, _opts, done) => {
	if (areClerkKeysSet(environment)) {
		let clerkOptions = {
			publishableKey: environment.CLERK_PUBLISH_KEY,
			secretKey: environment.CLERK_SECRET_KEY,
			jwtKey: environment.CLERK_JWT_KEY,
		};

		instance.register(clerkPlugin, clerkOptions);
	} else {
		console.warn('No Clerk keys set. Authentication is disabled.');
	}

	if (!isDevelopment) getSendChatPath(fastify);
	done();
};
