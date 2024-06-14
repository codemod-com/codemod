import type { FastifyReply, FastifyRequest } from "fastify";

import { createClerkClient } from "@clerk/backend";
import { clerkOptions } from "../../config";

import { env } from "../../utils";

const clerk = createClerkClient(clerkOptions);

export async function validateToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId, sessionClaims } = request.auth;

  if (!userId) {
    return reply.code(401).send();
  }

  reply.type("application/json").code(200);
  return { userId, sessionClaims };
}

export async function getOAuthToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = request.auth;

  if (!userId) {
    return reply.code(401).send();
  }

  const { data } = await clerk.users.getUserOauthAccessToken(
    userId,
    "oauth_github",
  );

  const token = data[0]?.token;

  reply.type("application/json").code(200);
  return { token };
}

export async function getAppToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId, sessionId } = request.auth;

  if (!userId && !sessionId) {
    return reply.code(401).send();
  }

  const { jwt: token } = await clerk.sessions.getToken(
    sessionId,
    env.APP_TOKEN_NAME,
  );

  reply.type("application/json").code(200);
  return { token };
}

export async function revokeToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId, sessionId } = request.auth;

  if (!userId && !sessionId) {
    return reply.code(401).send();
  }

  await clerk.sessions.getToken(sessionId, env.APP_TOKEN_NAME);

  reply.type("application/json").code(200);
  return { success: true };
}
