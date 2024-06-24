import { type User, createClerkClient } from "@clerk/backend";
import type { FastifyReply, FastifyRequest } from "fastify";
import { clerkOptions } from "../../config/clerk";
import { env } from "../../config/env";

const clerk = createClerkClient(clerkOptions);

export async function validateToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId, sessionClaims } = request.auth;

  if (!userId && !sessionClaims) {
    return reply.code(401).send();
  }

  const user = sessionClaims?.user as User;

  const organizations = (
    await clerk.users.getOrganizationMembershipList({ userId })
  ).data.map(({ organization }) => organization);

  const namespaces = [...organizations.map(({ slug }) => slug), user?.username];

  if (namespaces.includes("verified-publishers")) {
    namespaces.push("codemod-com", "codemod.com");
  }

  reply.type("application/json").code(200);
  return { user, organizations, namespaces };
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
