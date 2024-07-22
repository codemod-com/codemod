import type { FastifyPluginCallback } from "fastify";
import { corsDisableHeaders } from "../dev-utils/cors.js";
import { getRootPath } from "./root.js";
import { getSendChatPath } from "./sendChat.js";
import { getVersionPath } from "./version.js";

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
  getSendChatPath(instance);
  done();
};
