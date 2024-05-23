import { clerkPlugin } from "@clerk/fastify";
import type { FastifyPluginCallback } from "fastify";
import { clerkApplied, environment, isDevelopment } from "../dev-utils/configs";
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
  if (clerkApplied) {
    const clerkOptions = {
      publishableKey: environment.CLERK_PUBLISH_KEY,
      secretKey: environment.CLERK_SECRET_KEY,
      jwtKey: environment.CLERK_JWT_KEY,
    };

    instance.register(clerkPlugin, clerkOptions);
  } else {
    if (!clerkApplied)
      console.warn("No Clerk keys set. Authentication is disabled.");
    // if (isDevelopment) console.info("ENV set to development");
  }

  getSendChatPath(instance);
  done();
};
