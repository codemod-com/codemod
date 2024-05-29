import { clerkPlugin } from "@clerk/fastify";
import type { FastifyPluginCallback } from "fastify";
import { environment } from "../dev-utils/configs";
import { corsDisableHeaders } from "../dev-utils/cors";
import { getRootPath } from "./root";
import { getSendChatPath } from "./sendChat";
import { getVersionPath } from "./version";

export const publicRoutes: FastifyPluginCallback = (instance, _opts, done) => {
  [getRootPath, getVersionPath].forEach((f) => f(instance));
  instance.options("/sendChat", (request, reply) => {
    reply.status(204).headers(corsDisableHeaders).send();
  });

  done();
};

export const protectedRoutes: FastifyPluginCallback = (
  instance,
  _opts,
  done,
) => {
  const clerkOptions = {
    publishableKey: environment.CLERK_PUBLISH_KEY,
    secretKey: environment.CLERK_SECRET_KEY,
    jwtKey: environment.CLERK_JWT_KEY,
  };

  instance.register(clerkPlugin, clerkOptions);

  getSendChatPath(instance);

  done();
};
